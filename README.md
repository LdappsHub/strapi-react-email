# Strapi plugin strapi-react-email

This is strapi plugin which enables [react-email](https://react.email). The React email is nice 
package to create modern emails.

## Features
 - Create react email template by JSX/TSX
 - Prepare all setting for email. Subject, from, replyTo etc.
 - Live preview of final html code send by e.g. nodemailer
 - Prepare test data for your email e.g. User info and see result immediately
 - Send test email
 - Localization enabled

## Api
```typescript
strapi.plugin('strapi-react-email')
      .service('reactEmail')
      .sendEmail({
        id,
        slug,
        to,
        locale: 'en',
        emailProps,
      })
```
 - **id** - id of email template gathered from admin panel, could be undefined but slug must be used
 - **slug** - slug prefer way how to use email template, could be undefined but id must be used
 - **to** - recipient
 - **locale** - localization
 - **emailProps** - custom object which is passed to JSX/TSX code

## Limitation
 - At the end of any template there is injected code by server. This means that entry component is **Email**!
```typescript
`\nresultHtml = render(Email({ ...emailProps }));`
```
 - Of course components using import/export could not be done. Everything is in one string.
 - Preview is done by iframe. So any external links will not work due to **blocked csp**.





