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
      .sendTestEmail(id, to, emailProps)
```
 - **id** - id of email template gathered from admin panel
 - **to** - recipient
 - **emailProps** - custom object which is passed to JSX/TSX code

## Limitation
 - At the end of any template there is injected code by server. This means that entry component is **Email**!
```typescript
`\nresultHtml = render(Email({ ...emailProps }));`
```
 - Of course components using import/export could not be done. Everything is in one string.
 - Preview is done by iframe. So any external links will not work due to **blocked csp**. But for the emails
is better to not use external links for images because every email clients complains

## To improve
 - Current implementation of admin panel is using only content manager api. 
In the future probably will be better to inject plugin components into content-manager.
   - In current strapi there is no option in schema to hide field
   - Maybe for this required field strapi custom field is option
 - Code editor is hardcoded to maxWidth: 800 because when really long string is in code horizontal
scroll bar is visible and whole UI needs to be scrolled. Some trials with strapi-design system and flex
was done but without success.




