'use strict';


// include the required node modules
const fs = require('node:fs');
const path = require('node:path/posix');


// ensure all the user related directories do exist when the server gets started
for (const dir of ['config', 'endpoints', 'library', 'private/admin', 'public', 'templates', 'users']) {
  fs.mkdirSync(dir, { recursive: true });
}


// include the required custom libraries:
// * endpoints: collects and provides the endpoint management
// * http:      an overloaded http module which extends the default functionality
// * serve:     function to quickly serve static files from the filesystem
// * sessions:  automatic session and session cookie management
const endpoints = require('./system/library/endpoints.js');
const http = require('./system/library/http.js');
const serve = require('./system/library/serve.js');
const sessions = require('./system/library/sessions.js');


//
// config: Object<port: Number>
// (Default) configuration object read from disk.
let config = { port: 80 };
{
  // path to the configuration file in the public config directory
  const file = './config/port.json';

  // safely try to read the config file or create a new one if none exist or could not be read
  try {
    config = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    fs.writeFileSync(file, JSON.stringify(config, null, 2));
  }
}


// look for endpoint providing modules in the two given directories
endpoints.scan(['endpoints', 'system/endpoints']);


// create the actual webserver itself, which handles two kinds of targets: dynamic endpoints, which
// are provided in the custom and system endpoints and static file delivery as fallback, if no end-
// points is registered to handle a given pathname
const server = http.createServer(async (request, response) => {
  // create an url instance for the given requests url in order to comfortably extract the pathname
  const url = new URL(request.url, 'http://127.0.0.1');

  // use the session management class to extract a session cookie from the incoming request object
  // in order to manage an existing session (or create a new one) for the page requesting user and
  // provide access to the session object, which can be used to provide a server side user object to
  // fill with information
  const session = sessions.get(request, response);

  // dynamic endpoints
  // iterate over all registered endpoints and check if one matches the request url in order to let
  // the endpoint handle the rest of the request and response
  for (const endpoint of endpoints) {
    // check if we get a match for the current endpoint against the requests full url
    const match = endpoint.exec(url.href);
    if (match) {
      // execute the endpoints serve method and pass along any vital data related to the request
      const statusCode = await endpoint.serve(request, response, session, match);

      // an endpoint might directly return number which we will apply as the status code of the re-
      // sponse, but only if `response.end()` has not be called yet. within the condition we end the
      // response with a string like `400 Bad Request`.
      if (typeof statusCode === 'number' && !response.writableEnded) {
        response.statusCode = statusCode;
        response.end(`${statusCode} ${http.STATUS_CODES[statusCode]}`);
      }

      // the dynamic endpoint is now considered as handled by the endpoint module and thus we can
      // stop any further processing within the servers callback function
      return;
    }
  }

  // static file delivery
  // if we are still here then we assume the users request is targeted to retrieve a static file
  // from the server. so in order to proper serve that public file we build the relative path to it
  const file = path.join('public', url.pathname);

  // now check if the joined path attempts to escape the public directory, which is not allowed
  if (!file.startsWith('public/')) {
    response.statusCode = 403;
    response.end('403 Forbidden');
    return;
  }

  // at this point the request is legitimate and we delegate all further actions, like reading the
  //file reading, setting the mimetype as well as responding to the request to the serve function
  serve(response, file);
});


// start listening to incoming requests on the given port
server.listen(config.port);
