import { Strapi } from '@strapi/strapi';
import slugify from "@sindresorhus/slugify";


export default async ({ strapi }: { strapi: Strapi }) => {
  // bootstrap phase
  const res = await strapi.query('plugin::strapi-react-email.react-email-template').findOne({where: { isDefault: true, name: 'Reset password' }});
  const locale = await strapi.query('plugin::i18n.locale').findOne({where: {id: 1}});
  if(!res && locale) {

    const resetCode = 'import * as React from \'react\';\n' +
      'import { \n' +
      '  Html, \n' +
      '  Head,\n' +
      '  Preview,\n' +
      '  Tailwind,\n' +
      '  Body,\n' +
      '  Text,\n' +
      '  Container,\n' +
      '  Hr,\n' +
      '  Link\n' +
      '} from \'@react-email/components\';\n' +
      '\n' +
      'interface Props {\n' +
      '  user: { \n' +
      '    email: string;\n' +
      '    username: string\n' +
      '  };\n' +
      '  url: string;\n' +
      '  token: string;\n' +
      '}\n' +
      '\n' +
      'function Email({ user, url , token }: Props) {\n' +
      '  return (\n' +
      '    <Html lang="en">\n' +
      '      <Head />\n' +
      '      <Preview>{`Password reset forl ${user.email}`}</Preview>\n' +
      '      <Tailwind>\n' +
      '        <Body className="bg-[#111] my-auto mx-auto font-sans py-6">\n' +
      '          <Container className="border border-solid border-[#333] rounded my-[40px] my-auto mx-auto p-[20px] w-[465px]">\n' +
      '            <Text className="text-white font-bold text-[14px] leading-[16px]">\n' +
      '              {`Hello  ${user.username},`}\n' +
      '            </Text>\n' +
      '            <Text className="text-[#ABABAB] text-[14px] leading-[20px]">\n' +
      '              {`I\'ve heard that you forgot your password. But don\'t worry you can reset it via link bellow.`}\n' +
      '            </Text>\n' +
      '            <Hr className="border border-solid border-[#333] my-[24px] mx-0 w-full" />\n' +
      '            <Link className="bg-blue-500 text-white p-3 "  href={`${url}?code=${token}`}>Reset your password now</Link>\n' +
      '            <Text className="text-white mt-10 text-[14px] leading-[20px]">\n' +
      '              {`Best Regards,`}\n' +
      '            </Text>\n' +
      '            <Text className="text-white text-[14px] leading-[20px]">\n' +
      '              {`Daniel`}\n' +
      '            </Text>\n' +
      '          </Container>\n' +
      '        </Body>\n' +
      '      </Tailwind>\n' +
      '    </Html>\n' +
      '  );\n' +
      '}'
    const resetTestData = JSON.stringify({
      "url": "http://localhost:3000/reset-password",
      "server_url": "http://localhost:1337",
      "admin_url": "http://localhost:1337/admin",
      "user": {
        "email": "daniel.lazar@ldapps.cz",
        "username": "Daniel Lazar"
      },
      "token": "reset_token"
    },null, 2);
    const { compiledCode } = await strapi.plugin('strapi-react-email')
      .service('reactEmail').transpileFromData(resetCode, resetTestData);
    await strapi.query('plugin::strapi-react-email.react-email-template').create({
      data: {
        originCode: resetCode,
        transpiledCode: compiledCode,
        isDefault: true,
        testData: resetTestData,
        name: 'Reset password',
        locale: locale.code, slug: slugify('Reset password') }
    });

    const confirmCode = 'import * as React from \'react\';\n' +
      'import { \n' +
      '  Html, \n' +
      '  Head,\n' +
      '  Preview,\n' +
      '  Tailwind,\n' +
      '  Body,\n' +
      '  Text,\n' +
      '  Container,\n' +
      '  Hr,\n' +
      '  Link\n' +
      '} from \'@react-email/components\';\n' +
      '\n' +
      'interface Props {\n' +
      '  user: { \n' +
      '    email: string;\n' +
      '    username: string\n' +
      '  };\n' +
      '  url: string;\n' +
      '  token: string;\n' +
      '}\n' +
      '\n' +
      'function Email({ user, url , token }: Props) {\n' +
      '  return (\n' +
      '    <Html lang="en">\n' +
      '      <Head />\n' +
      '      <Preview>{`Password reset forl ${user.email}`}</Preview>\n' +
      '      <Tailwind>\n' +
      '        <Body className="bg-[#111] my-auto mx-auto font-sans py-6">\n' +
      '          <Container className="border border-solid border-[#333] rounded my-[40px] my-auto mx-auto p-[20px] w-[465px]">\n' +
      '            <Text className="text-white font-bold text-[14px] leading-[16px]">\n' +
      '              {`Hello  ${user.username},`}\n' +
      '            </Text>\n' +
      '            <Text className="text-[#ABABAB] text-[14px] leading-[20px]">\n' +
      '              {`Welcome to my channel, please confirm registration by clicking on button bellow`}\n' +
      '            </Text>\n' +
      '            <Hr className="border border-solid border-[#333] my-[24px] mx-0 w-full" />\n' +
      '            <Link className="bg-blue-500 text-white p-3 "  href={`${url}?confirmation=${token}`}>Confirm it now</Link>\n' +
      '            <Text className="text-white mt-10 text-[14px] leading-[20px]">\n' +
      '              {`Best Regards,`}\n' +
      '            </Text>\n' +
      '            <Text className="text-white text-[14px] leading-[20px]">\n' +
      '              {`Daniel`}\n' +
      '            </Text>\n' +
      '          </Container>\n' +
      '        </Body>\n' +
      '      </Tailwind>\n' +
      '    </Html>\n' +
      '  );\n' +
      '}'

    const confirmData = JSON.stringify({
      "url": "http://localhost:3000/email-confirmation",
      "server_url": "http://localhost:1337",
      "admin_url": "http://localhost:1337/admin",
      "user": {
        "email": "daniel.lazar@ldapps.cz",
        "username": "Daniel Lazar"
      },
      "token": "confirmation_token"
    }, null, 2);
    const { compiledCode: confirmCompiledCode } = await strapi.plugin('strapi-react-email')
      .service('reactEmail').transpileFromData(confirmCode, confirmData);
    await strapi.query('plugin::strapi-react-email.react-email-template').create({
      data: {
        originCode: confirmCode,
        transpiledCode: confirmCompiledCode,
        testData: confirmData,
        isDefault: true,
        name: 'Email address confirmation',
        locale: locale.code,
        slug: slugify('Email address confirmation') }
    });
  }
};
