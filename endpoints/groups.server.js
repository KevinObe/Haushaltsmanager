'use strict';

const fs = require('node:fs');

endpoints.add('/api/v1/checkGroup', (request, response, session) => {
  if(session.profile.groups){
    response.statusCode = 200;
    response.end(JSON.stringify(session.profile.groups[0]));
    return;
  }
  console.log('nope');
  response.end();
});
