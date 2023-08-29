'use strict';

const serverFile = require('./events.server.js');
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

endpoints.add('/api/v1/calendarEvents', (request, response, session, match) => {
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

  let file = `users/${session.profile.username}/calendarEvents.json`;
  let calendarEvents;

  fs.readFile(file, (error, data) => {
    response.setHeader('Content-Type', 'application/json');

    if(error){
      console.log(error)
      response.statusCode = 500;
      response.end('fehler beim Laden der Events');
      return;
    }

    if(!error){
      try{
        calendarEvents = JSON.parse(data);
      } catch(error){
        console.log(error)
        response.statusCode = 500;
        response.end('fehler beim parsen der Events');
        return;
      }
    }
    console.log('Kalender-Ereignisse')
    response.end();
  });//readFile
});//enpoint GET

endpoints.add('/api/v1/calendarEvents/:id', (request, response, session) => {
  if(!['POST', 'DELETE'].includes(request.method)){
    response.statusCode = 405;
    response.end();
    return;
  }

  if(!session.profile){
    response.statusCode = 403;
    response.end();
    return;
  }

  console.log(request.url)
  let file = `users/${session.profile.username}/calendarEvents.json`;

  fs.readFile(file, (error, data) => {
    let calendarEvents = [];

    if(!error){
      try{
    calendarEvents = JSON.parse(data);
    }
    catch (error){
      console.log('Fehler beim Parsen der Ereignisse:', error);
        response.statusCode = 500;
        response.end();
        return;
      }
    };

    let body = '';
    request.on('data', (chunk) => body += chunk);
    request.on('end', () => {
      let clickedDay;
      try{
      clickedDay = JSON.parse(body);
      }
      catch(error){
        console.log(error)
        response.end();
        return;
      }
      console.log(clickedDay);
      module.exports = clickedDay;
      console.log(module.exports)

      response.end();
      return;

    }); //request.on
  });//fs.readFile
});//endpoint
