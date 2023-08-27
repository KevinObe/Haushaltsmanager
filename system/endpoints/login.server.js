'use strict';


// include the required modules
const crypto = require('node:crypto');
const fs = require('node:fs');
const serve = require('../library/serve.js');


//
// config: Object<duration: Number, extendAfter: Number, logging: Boolean>
// Read the configuration file, which is managed by the sessions library, because we will use its
// logging attribute in order to determine if logins and logouts shall be logged at all.
const config = require('../../config/sessions.json');


//
// GET,HEAD,POST /login{.html}?
// Add an endpoint to handle all matters related to the login like serving the (default) login page
// and login process itself.
endpoints.add('/login{.html}?', (request, response, session) => {
  // only allow the user to request this resource with a GET, HEAD or POST request
  if (!['GET', 'HEAD', 'POST'].includes(request.method)) {
    response.statusCode = 405;
    response.end('405 Method Not Allowed');
    return;
  }

  // using a GET or HEAD request the user will either get the default login page integrated into the
  // server or a custom one provided in the location `public/login.html`
  if (['GET', 'HEAD'].includes(request.method)) {
    // first try to read the custom login page provided within the public directory
    fs.access('public/login.html', (error) => {
      // if an error occured then we could not exist the custom login page thus we response with the
      // default integrated login page instead
      if (error) {
        // prepare and send the integrated default login page
        response.setHeader('Content-Type', 'text/html; charset=utf-8');
        response.end(`
          <!DOCTYPE html>
          <html lang="de">
            <head>
              <title>Anmelden</title>
              <meta charset="utf-8">
            </head>
            <body>
              <form method="post">
                <div>
                  <input type="text" name="username" placeholder="Benutzer" max="64" required>
                </div>
                <div>
                  <input type="password" name="password" placeholder="Passwort" max="512" required>
                </div>
                <input type="submit" value="Anmelden">
              </form>
            </body>
          </html>
        `);

        // the integrated login page has been served

        return;
      }

      // at this point the existence of the custom login page is confirmed thus serve that file
      serve(response, 'public/login.html');
    });

    // the login page has been served
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

  // ...and does not exceed a limit of 1.000 characters, which is our upload limit
  if (parseInt(size) > 1000) {
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

    // safely extract and check the username and password from the body
    let username, password;
    try {
      // extract the username from the body, ensure it is a string only consisting of numbers or
      // letters and does not exceed a limit of 64 signs
      username = body.get('username');
      if (!username) throw 'missing username';
      if (!username.match(/^[a-z0-9]+$/i)) throw 'invalid username';
      if (username.length > 64) throw 'username too large';

      // extract the password from the body and ensure it is truthy
      password = body.get('password');
      if (!password) throw 'missing password';
    }

    // catch any errors which occur when extracting and testing the sent body data
    catch(error) {
      if (config.logging) {
        console.log(`Error with login credentials: ${error}.`);
      }
      response.statusCode = 400;
      response.end('400 Bad Request');
      return;
    }

    // ensure that the sent username does not contain any leading or trailing whitespace and is
    // always lowercased, so it is treated case insensitive
    username = username.trim().toLowerCase();

    // build the path to the users profile file and read it from disk
    const file = `users/${username}/profile.json`;
    fs.readFile(file, 'utf8', (error, data) => {
      // if an error occured then the most likely issue is that the directory of the user does not
      // exist, which indicates that the user does not exist
      if (error) {
        if (config.logging) {
          console.log(`Invalid username '${username}'.`);
        }
        response.statusCode = 403;
        response.end('403 Forbidden');
        return;
      }

      // currently we have the users profile as json string, so we need to safely parse it. because
      // parsing a json file always has a risk of failing we need to apply a proper error handling
      // around this process.
      let profile;
      try {
        profile = JSON.parse(data);
      } catch(error) {
        if (config.logging) {
          console.log(`Error parsing the profile of the user '${username}':`, error);
        }
        response.statusCode = 500;
        response.end('500 Internal Server Error');
        return;
      }

      // in order to check if the entered password of the user matches the stored password within
      // the profile we need to calculate its hash first (never store a password in raw form on a
      // server!)
      const hash = crypto
        .createHash('sha256')
        .update(`${profile.id}:${username}:${password}`)
        .digest('hex');

      // now compare the hash of the given password with the stored one within the profile and check
      // if the password hashes do not match
      if (profile.password !== hash) {
        if (config.logging) {
          console.log(`Invalid password for user '${username}'.`);
        }
        response.statusCode = 403;
        response.end('403 Forbidden');
        return;
      }

      // at this point the login succeeded thus we store the full profile within the session, which
      // is the indicator of a successful login and also easily provides any user information, like
      // the groups of the user, via the session object
      session.profile = profile;
      session.save();

      // forward the user to the private homepage, which is only accessable for logged in users
      response.statusCode = 302;
      response.setHeader('Location', 'private/home.html');
      response.end();
    });
  });
});


//
// GET /logout{.html}?
// Add an endpoint to handle the logout of a user and forward back to the homepage.
endpoints.add('/logout{.html}?', (request, response, session) => {
  // remove the profile from the session indicating that the session owner is no longer logged in
  delete session.profile;
  session.save();

  // forward the user back to the public homepage
  response.statusCode = 302;
  response.setHeader('Location', '/');
  response.end();
});
