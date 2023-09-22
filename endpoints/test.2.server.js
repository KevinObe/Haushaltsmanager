'use strict';
const clickedList = require('./test.server.js');

const fs = require('node:fs');

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
    console.log('Einkaufslisten')
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

    if(request.method === 'DELETE'){
      const url = new URL(request.url, 'http://127.0.0.1');
      let urlParts = url.pathname.split('/');
      let entryId = urlParts[4];

      let index;
      for(let shoppingList of shoppingLists){
        for(let i = 0; i < shoppingList.entries.length; i++){
          if(shoppingList.entries[i].id === entryId){
            console.log(shoppingList.entries[i].id)
            console.log(entryId)
            index = i;
            console.log(index)

            shoppingList.entries.splice(index, 1);
          }
        }
      }

      fs.writeFile(file, JSON.stringify(shoppingLists, null, 2), (error) => {
        if(error){
          response.statusCode = 500;
          response.end();
          return
        }

        response.statusCode = 204;
        response.end();
      })
      return;
    }

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
          entries.push(entry);
        }
      }

      let index = shoppingLists.findIndex((shoppingList) => shoppingList.id === listIndex);

      if (index === -1) {
        shoppingLists.push(shoppingList);
      };

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
