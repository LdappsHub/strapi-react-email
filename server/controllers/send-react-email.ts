import { Strapi } from '@strapi/strapi';

export default ({ strapi }: { strapi: Strapi }) => ({
  async sendTestEmail(ctx) {
    const { id } = ctx.params;
    if(!ctx.request.body.to) {
      ctx.badRequest('Missing "to" parameter');
    }
    /*ctx.body = await strapi
      .plugin('strapi-react-email')
      .service('reactEmail')
      .sendTestEmail({
        id,
        to: ctx.request?.body?.to,
        originCode: ctx.request?.body?.template || undefined,
        testData: ctx.request?.body?.testData || undefined
      });*/
    ctx.body = await strapi
      .plugin('strapi-react-email')
      .service('reactEmail')
      .sendEmail({
        slug: 'hello-strapi',
        to: ctx.request?.body?.to,
        locale: 'en',
        emailProps: JSON.parse(ctx.request?.body?.testData) || undefined,
      })
  },
  async transpileAndTest(ctx) {
    try {
      const { id } = ctx.params;
      ctx.body = await strapi
        .plugin('strapi-react-email')
        .service('reactEmail')
        .transpileReactEmail({ id,
          originCode: ctx.request?.body?.template || undefined,
          testData: ctx.request?.body?.testData || undefined });
    } catch (e) {
      const body = {
        html: `
        <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Error Message</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #fff;
            padding: 20px;
            margin: 0;
          }
          .error-container {
            background-color: #ffdddd; /* Light red background */
            color: #d8000c; /* Dark red text */
            border: 1px solid #d8000c;
            padding: 10px;
            margin: 20px 0;
            border-radius: 5px;
          }
        </style>
      </head>
      <body>
        <div class="error-container">
          <strong>Error:</strong> ${e.toString()}.
        </div>
      </body>
    </html>
        `
      }
      ctx.badRequest(e.toString(), body);
    }
  },
});
