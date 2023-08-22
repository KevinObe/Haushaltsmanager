'use strict';


// include the required modules
const path = require('node:path/posix')
const serve = require('../library/serve.js');


//
// GET /private/admin/*
// Add an endpoint that allows logged in users, which are part of the `admin` group, to access the
// static files of the `private/admin` directory
endpoints.add('/private/admin/*', (request, response, session) => {
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

  // at this point the access to the file is allowed thus use the serve method to retrieve the user
  // requested file from disk
  serve(response, file);
});


//
// GET /private/*
// Add an endpoint that allows logged in users to access static files of the `private` directory
endpoints.add('/private/*', (request, response, session) => {
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

  // at this point the access to the file is allowed thus use the serve method to retrieve the user
  // requested file from disk
  serve(response, file);
});
