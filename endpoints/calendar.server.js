'use strict';

const fs = require('node:fs/promises');

endpoints.add('/api/v1/savedEvents', async (request, response, session) => {
  if(!['GET', 'HEAD'].includes(request.method)){
    return 405;
  }

  if(!session.profile){
    return 403;
  }

  let file = `users/${session.profile.username}/calendarEvents.json`;
  let errorFile =
  [
    {
      "id": "1ee403f5-7503-421a-9ab6-66024dde5292",
      "eventTitle": "Beispiel event",
      "eventDate": "7 August 2023",
      "eventTime": "12:00"
    }
  ];
  try{
    const data = await fs.readFile(file, 'utf8');
    response.end(data);
    return 200;
  } catch (error) {
    await fs.writeFile(file, JSON.stringify(errorFile, null, 2));
    response.end(JSON.stringify(
      [
        {
          "id": "1ee403f5-7503-421a-9ab6-66024dde5292",
          "eventTitle": "Beispiel event",
          "eventDate": "7 August 2023",
          "eventTime": "12:00"
        }
      ]
    ));
  }
});

endpoints.add('/api/v1/calendarEvents/:id', async (request, response, session) => {
  if(!['POST', 'DELETE'].includes(request.method)){
    return 405;
  }

  if(!session.profile){
    return 403;
  }

  const size = parseInt(request.headers['content-length']);
  if (request.method === 'POST' && isNaN(size) || size > 1000) {
    return 413;
  }

  let file = `users/${session.profile.username}/calendarEvents.json`;
  let calendarEvents = [];
  try{
    const data = await fs.readFile(file, 'utf8');
    calendarEvents = JSON.parse(data);
  } catch(error) {
    return 500;
  }

  if(request.method === 'DELETE'){
    //handles the DELETE requests and ends the connection when deleted successfully;
    let index;
    const url = new URL(request.url, 'http://127.0.0.1');
    let urlParts = url.pathname.split('/');
    let eventId = urlParts[4];
    try{
      if(!eventId.match(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/)) throw 'Event ID does not match the pattern';
    } catch(error){
      console.log(error);
      response.end();
      return;
    }

    for(let i = 0; i < calendarEvents.length; i++){
      if(calendarEvents[i].id === eventId){
        index = calendarEvents.indexOf(calendarEvents[i]);
        calendarEvents.splice(index, 1);
      }
    }
    try{
    await fs.writeFile(file, JSON.stringify(calendarEvents, null, 2));
    } catch(error) {
      console.log(error);
      return 500;
    }
    response.end();
    return 200;
  };

  //collecting the content of the body to create a new event and save it to the server;
  let clickedDay; //represents the event object on the day the user selected;
  try{
    clickedDay = await new Promise((resolve, reject) => {
      let chunks = [];
      request.on('data', (chunk) => chunks.push(chunk));
      request.on('end', () => {
        resolve(JSON.parse(Buffer.concat(chunks)));
      });
      request.on('error', (error) => {
        reject(error);
      });
    });
  } catch(error) {
    console.log(error);
    return 400;
  };

  let newEvent;
  if(clickedDay.eventTitle !== '' || clickedDay.eventTime !== ''){
    newEvent = clickedDay;

    calendarEvents.push(newEvent);

    file = `users/${session.profile.username}/calendarEvents.json`;
    try{
      await fs.writeFile(file, JSON.stringify(calendarEvents, null, 2));
    } catch(error) {
      console.log('Fehler beim Speichern der Ereignisse:', error);
      return 500;
    }
    response.end()
    return 200;
  };

  session.clickedDay = clickedDay;
  response.end();
  return;
});

endpoints.add('/api/v1/calendarEvents', async (request, response, session) => {
  if(!['GET', 'HEAD'].includes(request.method)){
    return 405;
  }

  if(!session.profile){
    return 403;
  }

  let clickedDay = session.clickedDay;
  let data = JSON.stringify(clickedDay);

  response.end(data);
  return 204;
});
