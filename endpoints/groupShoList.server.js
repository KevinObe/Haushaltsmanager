'use strict';
const serverLists = require('./test.2.server.js');
const fs = require('node:fs');

endpoints.add('/private/{index.html}?', (request, response) => {
  response.statusCode = 302;
  response.setHeader('Location', '/private/shopping.html');
  response.end();
});

endpoints.add(`/api/v1/groupShoppinglist/:id`, (request, response, session, match) => {
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

  if(session.profile.groups.length < 1){
    response.statusCode = 409;
    response.end();
    return;
  }

  console.log(request.url)

  let joinedGroup = session.profile.groups[0];
  let file = `config/groups/${joinedGroup.groupname}/shoppingLists.json`;
  fs.readFile(file, (error, data) => {
    if(error){
      console.log('Fehler beim auslesen der Datei',error)
      response.end();
      return;
    }
    let index;
    let shoppingLists = JSON.parse(data);
    for(const list of shoppingLists){
      index = list.id;

      if(request.url.endsWith(index)){
        console.log('gotcha')
        session.shoppinglist = list;
        console.log(session)

        response.setHeader('Location', '/private/shopping.html');
        response.end(JSON.stringify(list));
        return;
      }
    }
    response.end(data);
    return;
  })
});

endpoints.add(`/api/v1/groupShoppinglist`, (request, response, session) => {
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

  if(session.profile.groups.length < 1){
    response.statusCode = 409;
    response.end();
    return;
  }

  let joinedGroup = session.profile.groups[0];
  let file = `config/groups/${joinedGroup.groupname}/shoppingLists.json`;
  let shoppingLists = [];
  let clickedList = session.shoppinglist;
  fs.readFile(file, (error, data) => {
    if(error){
      console.log('Keine Datei gefunden.');
      response.statusCode = 500;
      response.end('500, internal Server error.');
      return;
    }

    try{
      shoppingLists = JSON.parse(data);
    } catch(error){
      console.log('Fehler beim parsem der Listen', error);
    }

    for(const list of shoppingLists){
      if(list.id === clickedList.id){
        console.log('ID is a match.');
        return;
      }
    };
    return;
  })
  response.statusCode = 200;
  response.end(JSON.stringify(clickedList));
});

endpoints.add(`/api/v1/groupShoppingList/:id`, (request, response, session) => {
  console.log('neuer endpoint');
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

  if(session.profile.groups.length < 1){
    response.statusCode = 409;
    response.end();
    return;
  }

  let joinedGroup = session.profile.groups[0];
  let file = `config/groups/${joinedGroup.groupname}/shoppingLists.json`;
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
        console.log(1)
      }
    }

    let index = shoppingLists.findIndex((shoppingList) => shoppingList.id === listIndex);

      if (index === -1) {
        shoppingLists.push(shoppingList);
        console.log(2)
      };

      fs.writeFile(file, JSON.stringify(shoppingLists, null, 2), (error) => {
        console.log('speichern ...')
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
    });
  });
});
