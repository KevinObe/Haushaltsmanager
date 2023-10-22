'use strict';

const fs = require('node:fs/promises');
const liveClients = require('../private/SSE');

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

  let group = session.profile.groups[0];
  console.log(group)
  if(request.method === 'GET') {

    liveClients.push(response);
    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Connection', 'keep-alive');
    response.setHeader('Cache-Control', 'no-cache');

    request.on('close', () => {
      liveClients.splice(liveClients.indexOf(response), 1);
      console.log('User disconnected');
    });
    return;
  }

  if(request.method === 'POST') {
    liveClients.push(response);
    console.log('hier ist der request angekommen.');

    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Connection', 'keep-alive');
    response.setHeader('Cache-Control', 'no-cache');

    liveClients.send({
      type: 'online',
      info: `${session.profile.username} ist online.`,
      group: {
        id: false //needed to avoid errors
      }
    });

    console.log('Message has been sent.')
    response.statusCode = 204;
    response.end();
    return;
  };
});

endpoints.add('/api/v1/live/:id', async (request, response, session) => {
  if(request.method === 'GET') {

    if(session.onlineCounter === 0){
      return 204;
    }

    if(!session.profile){
      return 403;
    }

    if(session.profile.groups.length !== 1){
      return 500;
    }

    let group = session.profile.groups[0];

    liveClients.send({
      type: 'online',
      info: `${session.profile.username} ist online.`,
      group: group,
    });
    liveClients.push(response);
    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Connection', 'keep-alive');
    response.setHeader('Cache-Control', 'no-cache');

    console.log('Message has been sent.')
    session.onlineCounter = 0;
    response.statusCode = 204;
    response.end();
    return;
  }

  if(request.method === 'POST'){
    if(!session.profile){
      return 403;
    }

    if(session.profile.groups.length !== 1){
      return 500;
    }

    let group = session.profile.groups[0];

    liveClients.send({
      type: 'online',
      info: `${session.profile.username} ist der Gruppe beigetreten.`,
      group: group,
    });
    liveClients.push(response);
    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Connection', 'keep-alive');
    response.setHeader('Cache-Control', 'no-cache');

    console.log('Message has been sent.');
    response.statusCode = 204;
    response.end();
    return;
  }
});

endpoints.add(`/api/v1/liveShopping/:id`, async (request, response, session) => {
  if(request.method === 'POST'){
    if(!session.profile){
      return 403;
    }

    if(session.profile.groups.length !== 1){
      return 500;
    }

    let group = session.profile.groups[0];

    let shoppingList = {};
    let chunks = [];
    try{
      shoppingList = await new Promise((resolve, reject) => {
        request.on('data', (chunk) => chunks.push(chunk));
        request.on('end', () => {
          resolve(JSON.parse(Buffer.concat(chunks)));
        });
        request.on('error', () => {
          reject(error);
        });
      });
    } catch(error){
      console.log(error);
      return 500;
    };
    console.log(shoppingList)
    liveClients.send({
      type: 'shoppingList',
      info: `${session.profile.username} hat die Liste ${shoppingList.title} erstellt.`,
      content: shoppingList,
      group: group,
    });

    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Connection', 'keep-alive');
    response.setHeader('Cache-Control', 'no-cache');

    console.log('Message has been sent.');
    response.statusCode = 204;
    response.end();
    return;
  }
});

endpoints.add(`/api/v1/liveShoppingList/:id`, async (request, response, session) => {
  if(request.method === 'POST'){
    if(!session.profile){
      return 403;
    }

    if(session.profile.groups.length !== 1){
      return 500;
    }

    let group = session.profile.groups[0];

    let entry = {};
    let chunks = [];
    try{
      entry = await new Promise((resolve, reject) => {
        request.on('data', (chunk) => chunks.push(chunk));
        request.on('end', () => {
          resolve(JSON.parse(Buffer.concat(chunks)));
        });
        request.on('error', () => {
          reject(error);
        });
      });
    } catch(error){
      console.log(error);
      return 500;
    };

    console.log(entry)
    liveClients.send({
      type: 'entry',
      info: `Neuer Eintrag von ${session.profile.username}.`,
      content: entry,
      group: group,
    });

    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Connection', 'keep-alive');
    response.setHeader('Cache-Control', 'no-cache');

    console.log('Message has been sent.');
    response.statusCode = 204;
    response.end();
    return;
  }
});

endpoints.add(`/api/v1/liveToDo/:id`, async (request, response, session) => {
  if(request.method === 'POST'){
    if(!session.profile){
      return 403;
    }

    if(session.profile.groups.length !== 1){
      return 500;
    }

    let group = session.profile.groups[0];

    let note = {};
    let chunks = [];
    try{
      note = await new Promise((resolve, reject) => {
        request.on('data', (chunk) => chunks.push(chunk));
        request.on('end', () => {
          resolve(JSON.parse(Buffer.concat(chunks)));
        });
        request.on('error', () => {
          reject(error);
        });
      });
    } catch(error){
      console.log(error);
      return 500;
    };
    console.log(note)
    if(note.done === false){
      liveClients.send({
        type: 'ToDo',
        info: `${session.profile.username} hat eine ToDo erstellt.`,
        content: note,
        group: group,
      });
    }

    if(note.done === true){
      liveClients.send({
        type: 'ToDo',
        info: `${session.profile.username} hat eine ToDo erledigt.`,
        content: note,
        group: group,
      });
    }

    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Connection', 'keep-alive');
    response.setHeader('Cache-Control', 'no-cache');

    console.log('Message has been sent.');
    response.statusCode = 204;
    response.end();
    return;
  }
});
