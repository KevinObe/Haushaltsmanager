'use strict';

const fs = require('node:fs/promises');

endpoints.add(`/api/v1/shoppinglist/:id`, async (request, response, session) => {
  if(!['GET', 'HEAD'].includes(request.method)){
    return 405;
  }

  if(!session.profile){
    return 403;
  }
  console.log(request.url)

  let shoppingLists;
  let file = `users/${session.profile.username}/shoppingLists.json`;
  try{
    let data = await fs.readFile(file, 'utf8');
    shoppingLists = JSON.parse(data);
  } catch(error) {
    console.log('Fehler beim auslesen der Datei',error)
    return 500;
  }

  let index;
  for(const list of shoppingLists){
    index = list.id;

    if(request.url.endsWith(index)){
      console.log('gotcha', list)
      session.list = list;

      response.end(JSON.stringify(list));
      return 200;
    }
  }
});


endpoints.add('/api/v1/shoppinglist', async (request, response, session) => {
  if(!['GET', 'HEAD'].includes(request.method)){
    return 405;
  }

  if(!session.profile){
    return 403;
  }

  let shoppingLists;
  let file = `users/${session.profile.username}/shoppingLists.json`;
  try{
    let data = await fs.readFile(file, 'utf8');
    shoppingLists = JSON.parse(data);
  } catch(error) {
    console.log(error);
    response.end('fehler beim Laden der Einträge');
    return 500;
  }

  let clickedList = session.list;
  for(let listId of shoppingLists){
    if(listId.id === clickedList.id){
      console.log('ID is a match');
      response.end(JSON.stringify(clickedList));
      return;
    }
  }
  console.log('Einkaufslisten');
  response.end();
});

endpoints.add(`/api/v1/shoppingList/:id`, async (request, response, session) => {
  if(!['POST', 'DELETE'].includes(request.method)){
    return 405;
  }

  if(!session.profile){
    return 403;
  }
  console.log(request.url);

  let listIndex;
  let shoppingLists;
  let file = `users/${session.profile.username}/shoppingLists.json`;
  try{
  let data = await fs.readFile(file, 'utf8');
  shoppingLists = JSON.parse(data);
  } catch(error) {
    console.log('Fehler beim auslesen der Datei',error)
    return 500;
  }

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

    try{
      await fs.writeFile(file, JSON.stringify(shoppingLists, null, 2));
    } catch(error) {
      console.log(error);
      return 500;
    }
    response.end();
    return 204;
  };

  let entry;
  try{
    let chunks = [];
    entry = await new Promise((resolve, reject) => {
      request.on('data', (chunk) => chunks.push(chunk));
      request.on('end', () => {
        resolve(JSON.parse(Buffer.concat(chunks)));
      });
      request.on('error', () => {
        reject(error);
      });
    });
  } catch(error) {
    console.log(error);
    return 500;
  }

  if(entry.listId === ''){
    response.end('Fehler beim Speichern');
    return 500;
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

  try{
    await fs.writeFile(file, JSON.stringify(shoppingLists, null, 2));
  } catch(error) {
    console.log(error);
    response.end('Fehler beim speichern');
    return;
  }
  response.statusCode = 204;
  response.end();
});
