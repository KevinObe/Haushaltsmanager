'use strict';


// include the required modules
const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const getProfileForMail = require('../library/profile.js');
const mailer = require('../library/mail.js');
const serve = require('../library/serve.js');


//
// config: Object<duration: Number, extendAfter: Number, logging: Boolean>
// Read the configuration file, which is managed by the sessions library, because we will use its
// logging attribute in order to determine if logins and logouts shall be logged at all.
const config = require('../../config/sessions.json');


//
// isValidMail: RegExp
// Regular expression to match a valid mail adresse, take from https://stackoverflow.com/a/1373724
const isValidMail = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;


// register the first of two endpoints: this first one is used to process the reset the password re-
// quest and is called with the mail address of the user that wants to reset his password.
endpoints.add('/reset{.html}?', async ({ request, method, response }) => {
  // ignore this endpoint if the password reset feature is not enabled
  if (!config.passwordResetWithMail) return 403;

  // this endpoint can only be accessed with a post request, as a direct get based request would not
  // include the required password reset data
  if (method !== 'POST') return 405;

  // ensure the payload of the post request has a valid content length and is not too large
  const size = request.headers['content-length'];
  if (!size) return 411;
  if (parseInt(size) > 1000) return 413;

  // collect the body of the request and ensure it consists of a valid mail address
  let body = '';
  let mail;
  try {
    // collect all the chunks of the request
    for await (const chunk of request) {
      body += chunk;
    }

    // parse the request a url search params, as that is the default format of a html form based up-
    // load. from this object we directly extract and trim the content, which should be a valid mail
    // address
    mail = new URLSearchParams(body).get('mail').trim();

    // throw if the extracted mail is not a properly formatted mail address
    if (!mail.match(isValidMail)) throw 0;
  }

  // return a bad request if the body collection and parsing failed
  catch(error) {
    return 400;
  }

  // try to find a user profile containing the sent mail address
  const { path, profile } = await getProfileForMail(mail);

  // serve the reset homepage, either the user custom or system default one, in either cause, inde-
  // pendently of the existance of a profile with the given mail address, so we do not give off the
  // information if an associated profile does exist in the first place
  serve.default(response, 'public/reset.html', {
    '%MAIL%': mail,
  });

  // if a mail address matching profile has been prepare and send the password reset code
  if (profile) {
    // generate a uuid and only use the very first eigth digits
    const code = crypto.randomUUID().slice(0, 8);

    // add the password reset information to the users profile and add an expiration time to it,
    // which is 30 minutes by default
    profile.passwordReset = {
      code,
      validUntil: new Date(Date.now() + (config.passwordResetTimeout ?? 30_000)),
    };

    // safely try to save the updated profile with the password reset information
    try {
      await fs.writeFile(path, JSON.stringify(profile, null, 2));
    } catch {
      return 500;
    }

    // check if an user customised or system default template shall be used for the password reset
    // mail
    let template;
    try {
      template = await fs.readFile('templates/resetmail.html', 'utf-8');
    } catch {
      template = await fs.readFile('system/templates/resetmail.html', 'utf-8');
    }

    // safely try to send the password reset mail to the user
    try {
      await mailer.send(
        mail,
        'Passwort zurücksetzen',
        template
          .replaceAll('%CODE%', code)
          .replaceAll('%NAME%', profile.name.first)
          .replaceAll('%LASTNAME%', profile.name.name)
          .replaceAll('%USERNAME%', profile.username),
      );
    }

    // catch the error in case the mail could not be sent, but fail silently, so we do not leak any
    // information to the user about it, due to security considerations
    catch(error) {
      console.log('Sending the password restore link failed:', error);
    }
  }
});


// register the second of two endpoints: this one validates the entered password reset code sent to
// the user previously and sets the given new password, if the correct password reset code has been
// entered.
endpoints.add('/reseted{.html}?', async ({ request, method, response }) => {
  // ignore this endpoint if the password reset feature is not enabled
  if (!config.passwordResetWithMail) return 403;

  // this endpoint can only be accessed with a post request, as a direct get based request would not
  // include the required password reset data
  if (method !== 'POST') return 405;

  // ensure the payload of the post request has a valid content length and is not too large
  const size = request.headers['content-length'];
  if (!size) return 411;
  if (parseInt(size) > 1000) return 413;

  // collect the body of the request and ensure it consists of a valid mail address, code and new
  // password
  let body = '';
  let code, mail, password;
  try {
    // collect all the chunks of the request
    for await (const chunk of request) {
      body += chunk;
    }

    // parse the received post body as url search params, as that is the default format of a html
    // based form request
    body = new URLSearchParams(body);

    // extract and check the eight signs long hexadecimal password reset code
    code = body.get('code');
    if (!code) throw 'missing code';
    if (!code.match(/^[a-z0-9]{8}$/)) throw 'invalid code';

    // extract and check the mail address of the request
    mail = body.get('mail');
    if (!mail) throw 'missing mail';
    if (!mail.match(isValidMail)) throw 'invalid mail';
    if (mail.length > 512) throw 'mail too long';

    // ensure a password has been sent as well
    password = body.get('password');
    if (!password) throw 'missing password';
  }

  // return a bad request if the body collection and parsing failed
  catch(error) {
    return 400;
  }

  // try to find a user profile containing the sent mail address
  const { path, profile } = await getProfileForMail(mail);

  // if no profile has been found or if the sent code does not match the saved password reset code
  // of the profile return the proper http status code
  if (!profile || profile.passwordReset?.code !== code) return 403;

  // check if the password reset code is still valid, because by default it is only valid for 30
  // minutes
  if (Date.now() > new Date(profile.passwordReset.validUntil)) return 410;

  // hash the new password and save it to the profile
  profile.password = crypto
    .createHash('sha256')
    .update(`${profile.id}:${profile.username}:${password}`)
    .digest('hex');

  // delete the password reset code and its timeout information
  delete profile.passwordReset;

  // safely try to save the updated profile including the new password
  try {
    await fs.writeFile(path, JSON.stringify(profile, null, 2));
  } catch {
    return 500;
  }

  // serve the password successfully reseted homepage, either the user custom or system default page
  serve.default(response, 'public/reseted.html', {
    '%NAME%': profile.name.first,
    '%LASTNAME%': profile.name.last,
    '%USERNAME%': profile.username,
    '%MAIL%': profile.mail,
  });
});
