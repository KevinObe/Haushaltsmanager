'use strict';

const serverFile = require('./calendar.server.js');
const fs = require('node:fs');

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
