'use strict';

const fs = require('node:fs/promises');
const liveClients = require('../library/SSE');

endpoints.add('/api/v1/live', async (request, response, session) => {
  if(!['GET', 'POST'].includes(request.method)) {
    return 405;
  }

  if(!session.profile){
    return 403;
  }

  if(session.profile.groups.length !== 1){
    return 500;
  }

    liveClients.push(response);
    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Connection', 'keep-alive');
    response.setHeader('Access-Control-Allow-Origin', '*');

  request.on('close', () => {
    liveClients.splice(liveClients.indexOf(response), 1);
  });
  return;
});
