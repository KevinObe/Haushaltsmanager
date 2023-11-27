'use strict';


// include the required modules
const path = require('node:path/posix');
const serve = require('../library/serve.js');


//
// GET /{index.html}?
// Add a default homepage explaining the most rudimentary basics of the server in case the user has
// not provided a custom one yet.
endpoints.add('/{index.html}?', (request, response) => {
  // serve the user custom `public/index.html` file or the system default `system/public/index.html`
  serve.default(response, 'public/index.html');
});


//
// GET /private/admin/{index.html}?
// Add a default homepage explaining the most rudimentary basics of the server in case the user has
// not provided a custom one yet.
endpoints.add('/private/admin/{index.html}?', (request, response, session) => {
  // prepare the full url and relative path to the static file within the `private/admin` directory
  const url = new URL(request.url, 'http://127.0.0.1');
  const file = path.join('.', url.pathname);

  // disallow access for all not logged users, logged in users that are no admin or any directory
  // escape attempts
  if (
    !session.profile ||
    !session.profile.groups.includes('admin') ||
    !file.startsWith('private/admin/')
    ) {
    response.statusCode = 403;
    response.end('403 Forbidden');
    return;
  }

  // serve the user custom `public/index.html` file or the system default `system/public/index.html`
  serve.default(response, 'private/admin/index.html');
});


//
// GET /private/{index.html}?
// Add a default homepage explaining the most rudimentary basics of the server in case the user has
// not provided a custom one yet.
endpoints.add('/private/{index.html}?', (request, response, session) => {
  // prepare the full url and relative path to the static file within the `private` directory
  const url = new URL(request.url, 'http://127.0.0.1');
  const file = path.join('.', url.pathname);

  // disallow access for all not logged users or any directory escape attempts
  if (
    !session.profile ||
    !file.startsWith('private/')
    ) {
    response.statusCode = 403;
    response.end('403 Forbidden');
    return;
  }

  // serve the user custom `public/index.html` file or the system default `system/public/index.html`
  serve.default(response, 'private/index.html');
});
