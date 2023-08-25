'use strict';
const clickedList = require('./test.server.js');

const fs = require('node:fs');

endpoints.add('/{ìndex.html}?', (request, response) => {
  response.statusCode = 302;
  response.setHeader('Location', '/login.html');
  response.end();
});

endpoints.add('/private/{index.html}?', (request, response) => {
  response.statusCode = 302;
  response.setHeader('Location', '/private/shoppinglist.html');
  response.end();
});

endpoints.add('/api/v1/shoppinglist', (request, response, session) => {
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

  let shoppingLists;
  let file = `users/${session.profile.username}/shoppingLists.json`;
  fs.readFile(file, (error, data) => {
    response.setHeader('Content-Type', 'application/json');

    if(error){
      console.log(error)
      response.statusCode = 500;
      response.end('fehler beim Laden der Einträge');
      return;
    }

    if(!error){
      try{
        shoppingLists = JSON.parse(data);
      } catch(error){
        console.log(error)
        response.statusCode = 500;
        response.end('fehler beim parsen der Einträge');
        return;
      }
    }

    for(let listId of shoppingLists){
      if(listId.id === clickedList.id){
        console.log('ID is a match');
        response.end(JSON.stringify(clickedList));
        return;
      }
    }
    console.log('mia hen do')
    response.end();
  });
});

endpoints.add(`/api/v1/shoppingList/:id`, (request, response, session) => {
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
  console.log(request.url);

  let file = `users/${session.profile.username}/shoppingLists.json`;
  fs.readFile(file, (error, data) => {

    if(error){
      console.log('Fehler beim auslesen der Datei',error)
      response.end();
      return;
    }

    let listIndex;
    let shoppingLists;
    if(!error){
      try{
    shoppingLists = JSON.parse(data);
    }
    catch (error){
      console.log('Fehler beim Parsen der Einkaufslisten:', error);
        response.statusCode = 500;
        response.end();
        return;
      }
    };
    console.log(shoppingLists);
    console.log('confirmed');

    let body = '';
    request.on('data', (chunk) => body += chunk);
    request.on('end', () => {
      let entry;
      try{
      entry = JSON.parse(body);
      }
      catch(error){
        console.log(error)
        response.end();
        return;
      }
      console.log(entry)

      if(entry.listId === ''){
        response.statusCode = 500;
        response.end('Fehler beim Speichern');
        return;
      }
      let shoppingList;
      listIndex = entry.listId;
      let entries;

      for(shoppingList of shoppingLists){
        if(shoppingList.id === listIndex){
          entries = shoppingList.entries;
          console.log('its a match')
          console.log(shoppingList)
          console.log(entries)
          entries.push(entry);
          console.log('push')
          console.log(shoppingList)
          console.log(entries)
        }
      }

      const index = shoppingLists.findIndex((shoppingList) => shoppingList.id === listIndex);

      if (index === -1) {
        shoppingLists.push(shoppingList);
      };

      console.log(shoppingLists)
      console.log(index)
      console.log(shoppingList)

      fs.writeFile(file, JSON.stringify(shoppingLists, null, 2), (error) => {
        if(error){
          response.statusCode = 500;
          response.end('Fehler beim speichern');
          return;
        }
        response.statusCode = 204;
        response.end();
      })

      response.end();
      return;
    })
  })
});
