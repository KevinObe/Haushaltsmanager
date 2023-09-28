'use strict';

const fs = require('node:fs');

endpoints.add('/api/v1/savedEvents', (request, response, session) => {
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

  fs.readFile(file, (error, data) => {
    response.setHeader('Content-Type', 'application/json');

    if(error){
      console.log(error)
      response.statusCode = 500;
      response.end('fehler beim Laden der Events');
      return;
    }

    response.end(data);

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

     //events löschen
     if(request.method === 'DELETE'){
      console.log(calendarEvents, 'Hier sind wir')

      let index;
      const url = new URL(request.url, 'http://127.0.0.1');
      let urlParts = url.pathname.split('/');
      let eventId = urlParts[4];

      for(let i = 0; i < calendarEvents.length; i++){
        if(calendarEvents[i].id === eventId){
          index = calendarEvents.indexOf(calendarEvents[i]);
          calendarEvents.splice(index, 1);
        }
      }

      fs.writeFile(file, JSON.stringify(calendarEvents, null, 2), (error) => {
        if(error){
          response.statusCode = 500;
          response.end();
          return;
        }

        response.statusCode = 204;
        response.end();
      });
      return;
    }

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

      //fertiges event speichern
      console.log('ab hier')
      console.log(clickedDay)
      console.log(calendarEvents)

      let newEvent;
      if(clickedDay.eventTitle !== '' || clickedDay.eventTime !== ''){
        newEvent = clickedDay;

        calendarEvents.push(newEvent);

        file = `users/${session.profile.username}/calendarEvents.json`;

        fs.writeFile(file, JSON.stringify(calendarEvents, null, 2), (error) => {
          if(error){
            console.log('Fehler beim Speichern der Ereignisse:', error);
            response.statusCode = 500;
            response.end();
            return;
          }
          response.end()
          return;
        })
        response.end()
        return;
      }
      console.log(session)

      session.clickedDay = clickedDay;
      response.end();
      return;

    }); //request.on
  });//fs.readFile
});//endpoint

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

  let clickedDay = session.clickedDay;
  console.log(clickedDay, 'events.server.js');

  let data = JSON.stringify(clickedDay);

response.end(data);

}); //endpoint GET
