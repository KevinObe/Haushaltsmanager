'use strict';


// include the required modules
const crypto = require('node:crypto');
const fs = require('node:fs');
const serve = require('../library/serve.js');


//
// config: Object<enabled: Boolean>
// (Default) configuration object read from disk.
let config = { enabled: true };
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
    // first try to read the custom register page provided within the public directory
    fs.access('public/register/register.html', (error) => {
      // if an error occured then we could not exist the custom register page thus we response with
      // the default integrated register page instead
      if (error) {
        // prepare and send the integrated default register page
        response.setHeader('Content-Type', 'text/html; charset=utf-8');
        response.end(`
          <!DOCTYPE html>
          <html lang="de">
            <head>
              <title>Registrieren</title>
              <meta charset="utf-8">
            </head>
            <body>
              <form method="post">
                <div>
                  <input type="text" name="firstname" placeholder="Vorname" required>
                  <input type="text" name="lastname" placeholder="Nachname" required>
                </div>
                <div>
                  <input type="text" name="username" placeholder="Benutzer" required>
                </div>
                <div>
                  <input type="password" name="password" placeholder="Passwort" required>
                </div>
                <input type="submit" value="Registrieren">
              </form>
            </body>
          </html>
        `);

        // the integrated register page has been served
        return;
      }

      // at this point the existence of the custom register page is confirmed thus serve that file
      serve(response, 'public/register/register.html');
    });

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
  request.on('end', () => {
    // now that the body has been fully received we parse it as a query string, which is the default
    // format a form from the client sends to us
    body = new URLSearchParams(body);

    // safely extract and check the username, password and names from the body
    let username, password, firstname, lastname;
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
        name: {
          first: firstname,
          last: lastname,
        },
      };

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
  // this endpoint is effectively overruling the default static file delivery in case the user has
  // provided a custom registered.html page, so in order to deliver our default one or the user
  // provided one we have to check if the latter is available
  fs.access('public/registered.html', (error) => {
    // if no custom index.html file is available, then use our internal one, which contains a simple
    // explanation of the server
    if (error) {
      response.setHeader('Content-Type', 'text/html; charset=utf-8');
      response.end(`
        <!DOCTYPE html>
        <html lang="de">
          <head>
            <title>Registriert</title>
            <meta charset="utf-8">
          </head>
          <body>
            <h1>Registriert</h1>
            <p>Hallo <i>${session.profile.name.first}</i>, du bist nun registriert und kannst dich mit dem Benutzernamen <code>${session.profile.username}</code> anmelden.</p>
            <a href="/login.html">Zum Login</a>
          </body>
        </html>
      `);

      // this endpoint has been served
      return;
    }

    // at this point we know that the user has created a custom index.html page, thus we serve that
    serve(response, 'public/registered.html');
  });
});
