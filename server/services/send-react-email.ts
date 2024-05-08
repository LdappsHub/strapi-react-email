import { Strapi } from '@strapi/strapi';
import ts from 'typescript';
import vm from "vm";
import {render} from "@react-email/render";

export default ({ strapi }: { strapi: Strapi }) => ({
  async transpileReactEmail(id: number, originCode?: string, testData?: string) {
    const template = await strapi.query('plugin::strapi-react-email.react-email-template').findOne({where: { id } });
    if (!template) {
      throw new Error('Template for this id not found');
    }
    const compilerOptions = {
      target: ts.ScriptTarget.ES5,
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.React,
    };
    const result = ts.transpileModule(originCode ? originCode : template.originCode, { compilerOptions });
    result.outputText += `\nresultHtml = render(Email({ ...emailProps }));`
    const compiledCode = result.outputText.replace('Object.defineProperty(exports, "__esModule", { value: true });', '');

    await strapi.query('plugin::strapi-react-email.react-email-template').update( {
      where: { id },
      data: {transpiledCode: compiledCode}
    });

    const context = {
      require,
      render,
      resultHtml: '',
      emailProps: JSON.parse(testData ? testData : template.testData)
    }
    vm.createContext(context);
    const code = new vm.Script(compiledCode);
    await code.runInContext(context);

    return { html: context.resultHtml };
  },
  async sendTestEmail(id: number, to: string, originCode?: string, testData?: string) {
    const template = await strapi.query('plugin::strapi-react-email.react-email-template').findOne({where: { id } });
    const html = await strapi
      .plugin('strapi-react-email')
      .service('reactEmail').transpileReactEmail(id, originCode, testData);

    const emailConfig = {
      from: template.shipperEmail,
      to,
      subject: template.subject,
      html: html.html,
      replyTo: template.responseEmail
    };
    await strapi.plugin('email').service('email').send(emailConfig);
  },
  async sendEmail(id: number, to: string, emailProps: object) {
    const template = await strapi.query('plugin::strapi-react-email.react-email-template').findOne({where: { id } });
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
