'use strict';


// include the required modules
const crypto = require('node:crypto');
const fs = require('node:fs');
const getProfileForMail = require('../library/profile.js');
const serve = require('../library/serve.js');


//
// isValidMail: RegExp
// Regular expression to match a valid mail adresse, take from https://stackoverflow.com/a/1373724
const isValidMail = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;


//
// config: Object<enabled: Boolean>
// (Default) configuration object read from disk, including the settings wether registration is en-
// abled in the first place and if the registration requires the user to provide a mail address.
let config = {
  enabled: true,
  includeMail: true,
};

{
  // path to the configuration file in the public config directory
  const file = './config/register.json';

  // safely try to read the config file or create a new one if none exist or could not be read
  try {
    config = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    fs.writeFileSync(file, JSON.stringify(config, null, 2));
  }
}


//
// GET,HEAD,POST /register{.html}?
// Add an endpoint to allow new users to register to this server (if enabled in the config file).
endpoints.add('/register/register{.html}?', (request, response, session) => {
  // only allow the user to request this resource with a GET, HEAD or POST request
  if (!['GET', 'HEAD', 'POST'].includes(request.method)) {
    response.statusCode = 405;
    response.end('405 Method Not Allowed');
    return;
  }

  // disallow the usage of this endpoint if it is not enabled in the config file
  if (!config.enabled) {
    response.statusCode = 403;
    response.end('403 Forbidden');
    return;
  }

  // using a GET or HEAD request the user will either get the default register page integrated into
  // the server or a custom one provided in the location `public/register.html`
  if (['GET', 'HEAD'].includes(request.method)) {
    // serve the user custom `public/register.html` file or the system default `system/public/
    // register.html`
    serve.default(response, 'public/register/register.html');

    // the register page has been served
    return;
  }

  // at this point we are only dealing with post requests. here we check if the user supplied length
  // header of the request is properly set...
  const size = request.headers['content-length'];
  if (!size) {
    response.statusCode = 411;
    response.end('411 Length Required');
    return;
  }

  // ...and does not exceed a limit of 2.000 characters, which is our upload limit
  if (parseInt(size) > 2000) {
    response.statusCode = 413;
    response.end('413 Payload Too Large');
    return;
  }

  // collect the body the user has sent as string
  let body = '';
  request.on('data', (chunk) => body += chunk);
  request.on('end', async () => {
    // now that the body has been fully received we parse it as a query string, which is the default
    // format a form from the client sends to us
    body = new URLSearchParams(body);

    // safely extract and check the username, password, names and (optionally, if configured) mail
    // address from the body
    let username, password, firstname, lastname, mail;
    try {
      // extract the username from the body, ensure it is a string only consisting of numbers or
      // letters and does not exceed a limit of 64 signs
      username = body.get('username');
      if (!username) throw 'missing username';
      if (!username.match(/^[a-z0-9]+$/i)) throw 'invalid username';
      if (username.length > 64) throw 'username too large';

      // extract and check the password
      password = body.get('password');
      if (!password) throw 'missing password';

      // extract and check the firstname
      firstname = body.get('firstname');
      if (!firstname) throw 'missing firstname';
      if (!firstname.match(/^[a-zöäüß ]+$/i)) throw 'invalid firstname';

      // extract and check the lastname
      lastname = body.get('lastname');
      if (!lastname) throw 'missing lastname';
      if (!lastname.match(/^[a-zöäüß ]+$/i)) throw 'invalid lastname';

      // if enabled check if a valid mail address has been provided as well
      if (config.includeMail) {
        // properly extract and check the mail address
        mail = body.get('mail');
        if (!mail) throw 'missing mail';
        if (!mail.match(isValidMail)) throw 'invalid mail';
        if (mail.length > 512) throw 'mail too long';

        // ensure the mail address is unique and not used by another user
        const { profile } = await getProfileForMail(mail);
        if (profile) {
          response.statusCode = 409;
          response.end('409 Conflict');
          return;
        }
      }
    }

    // catch any errors which occur when extracting and testing the sent body data
    catch(error) {
      console.log(`Register user error: ${error}`);
      response.statusCode = 400;
      response.end('400 Bad Request');
      return;
    }

    // ensure that the sent username does not contain any leading or trailing whitespace and is
    // always lowercased, so it is treated case insensitive
    username = username.trim().toLowerCase();

    // build the paths for the directory of the users as well as the profile file
    const dir = `users/${username}`;
    const file = `${dir}/profile.json`;

    // check if the user does already exist
    fs.access(file, (error) => {
      // if no error is present, then the profile file and thus an user of the given username does
      // already exist and the person trying to register is not allowed to proceed
      if (!error) {
        response.statusCode = 409;
        response.end('409 Conflict');
        return;
      }

      // build the profile object of the user by generating a new uuid and inserting the user sent
      // information
      const profile = {
        id: crypto.randomUUID(),
        username,
        password,
        groups: [],
        mail,
        name: {
          first: firstname,
          last: lastname,
        },
      };

      // above we inserted the mail address, so it is at a conventient spot within the config file,
      // but if the feature to require the mail address in the first place is not enabled, then re-
      // move it from the config, as it is not needed (and the variable value is undefined in the
      // first place)
      if (!config.includeMail) {
        delete profile.mail;
      }

      // never store any passwords in cleartext on the server! to comply with that rule we generate
      // a sha256 hashsum of the users profile and username (both are considered as the salt of the
      // hash) and the password the user wants to use
      profile.password = crypto
        .createHash('sha256')
        .update(`${profile.id}:${profile.username}:${profile.password}`)
        .digest('hex');

      // create the new users directory
      fs.mkdir(dir, (error) => {
        // an error should normally not occure when create the users directory, but everything that
        // can fail needs to be handled
        if (error) {
          response.statusCode = 500;
          response.end('500 Internal Server Error');
          return;
        }

        // create the users profile file
        fs.writeFile(file, JSON.stringify(profile, null, 2), (error) => {
          // creating the users file should also not lead to an error, but it needs to be considered
          if (error) {
            response.statusCode = 500;
            response.end('500 Internal Server Error');
            return;
          }

          // automatically login the newly created user
          session.profile = profile;
          session.save();

          // the registration was successful, so forward the user to a success page
          response.statusCode = 302;
          response.setHeader('Location', '/registered.html');
          response.end();
        });
      });
    });
  });
});


//
// GET /registered{.html}?
// Add a registration success page, which can be customised by proding a custom one in the public
// directory called `public/registered.html`.
endpoints.add('/registered{.html}?', (request, response, session) => {
  // serve the user custom `public/registered.html` file or the system default `system/public/
  // registered.html` and pass along some placeholders to better customise the page
  serve.default(response, 'public/register/registered.html', {
    '%NAME%': session.profile.name.first,
    '%LASTNAME%': session.profile.name.last,
    '%USERNAME%': session.profile.username,
    '%MAIL%': session.profile.mail,
  });
});
