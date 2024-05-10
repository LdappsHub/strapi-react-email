import { Strapi } from '@strapi/strapi';
import ts from 'typescript';
import vm from "vm";
import {render} from "@react-email/render";

export default ({ strapi }: { strapi: Strapi }) => ({
  async transpileReactEmail({id, originCode, testData}
                              :{id: number, originCode?: string, testData?: string}) {
    const template = await strapi.query('plugin::strapi-react-email.react-email-template').findOne({where: { id } });
    if (!template) {
      throw new Error('Template for this id not found');
    }
    const { compiledCode, html } = await strapi.plugin('strapi-react-email')
      .service('reactEmail').transpileFromData(originCode || template.originCode, testData || template.testData);

    await strapi.query('plugin::strapi-react-email.react-email-template').update( {
      where: { id },
      data: { transpiledCode: compiledCode }
    });

    return { html };
  },
  async transpileFromData(originCode: string, testData: string) {
    const compilerOptions = {
      target: ts.ScriptTarget.ES5,
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.React,
    };

    const result = ts.transpileModule(originCode, { compilerOptions });
    result.outputText += `\nresultHtml = render(Email({ ...emailProps }));`
    const compiledCode = result.outputText.replace('Object.defineProperty(exports, "__esModule", { value: true });', '');

    const context = {
      require,
      render,
      resultHtml: '',
      emailProps: JSON.parse(testData)
    }
    vm.createContext(context);
    const code = new vm.Script(compiledCode);
    await code.runInContext(context);

    return { html: context.resultHtml, compiledCode };
  },
  async sendTestEmailFromData(emailConfig: {
    from: string,
    to: string,
    subject?: string,
    replyTo?: string,
    html?: string
  }, originCode: string, testData: string) {
    const { html } = await strapi.plugin('strapi-react-email')
      .service('reactEmail').transpileFromData(originCode, testData);
    emailConfig.html = html;
    await strapi.plugin('email').service('email').send(emailConfig);
  },
  async sendTestEmail({id, to, originCode, testData}
                        :{id: number, to: string, originCode?: string, testData?: string}) {
    const template = await strapi.query('plugin::strapi-react-email.react-email-template').findOne({where: { id } });
    const { html } = await strapi
      .plugin('strapi-react-email')
      .service('reactEmail').transpileReactEmail({id, originCode, testData});

    const emailConfig = {
      from: template.shipperEmail,
      to,
      subject: template.subject,
      html,
      replyTo: template.responseEmail
    };
    await strapi.plugin('email').service('email').send(emailConfig);
  },
  async sendEmail({id, slug, locale, to, emailProps} : { id?: number, slug?: string, locale?: string, to: string, emailProps: string }) {
    let where = {$or: [{ id }, {slug}] } as any
    if(!id && slug) {
      where = { slug };
    }
    if(id && !slug) {
      where = { id };
    }
    if (locale) {
      where = {
        ...where,
        locale
      }
    }
    const template = await strapi.query('plugin::strapi-react-email.react-email-template').findOne({ where });
    if (!template) {
      throw new Error('Template for this id or slug not found');
    }
    const context = {
      require,
      render,
      resultHtml: '',
      emailProps
    }
    vm.createContext(context);
    const code = new vm.Script(template.transpiledCode);
    await code.runInContext(context);
    const emailConfig = {
      from: template.shipperEmail,
      to,
      subject: template.subject,
      html: context.resultHtml,
      replyTo: template.responseEmail
    };
    await strapi.plugin('email').service('email').send(emailConfig);
  }
});
