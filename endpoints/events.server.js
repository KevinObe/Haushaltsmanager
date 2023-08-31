'use strict';

const serverFile = require('./calendar.server.js');
const fs = require('node:fs');

endpoints.add('/{ìndex.html}?', (request, response) => {
  response.statusCode = 302;
  response.setHeader('Location', '/login.html');
  response.end();
});

endpoints.add('/private/{index.html}?', (request, response) => {
  response.statusCode = 302;
  response.setHeader('Location', '/private/shopping.html');
  response.end();
});

endpoints.add('/api/v1/calendarEvents', (request, response, session) => {
  if(!['GET', 'HEAD'].includes(request.method)){
    response.statusCode = 405;
    response.end();
    return;
  }

  if(!session.profile){
    response.statusCode = 403;
    response.end();
    return;
  }

  let clickedDay = serverFile;
  console.log(clickedDay, 'events.server.js');

  let data = JSON.stringify(clickedDay);


response.end(data);

}); //endpoint GET
