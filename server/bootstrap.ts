import { Strapi } from '@strapi/strapi';

export default async ({ strapi }: { strapi: Strapi }) => {
  // bootstrap phase
  const res = await strapi.query('plugin::strapi-react-email.react-email-template').findOne({where: { isDefault: true, name: 'Reset password' }});
  const locale = await strapi.query('plugin::i18n.locale').findOne({where: {id: 1}});
  if(!res) {
    await strapi.query('plugin::strapi-react-email.react-email-template').create({
      data: { originCode: '', transpiledCode: '', isDefault: true, name: 'Reset password', locale: locale.code }
    });
    await strapi.query('plugin::strapi-react-email.react-email-template').create({
      data: { originCode: '', transpiledCode: '', isDefault: true, name: 'Email address confirmation', locale: locale.code }
    });
  }
};
