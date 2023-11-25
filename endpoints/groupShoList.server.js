'use strict';

const fs = require('node:fs/promises');
const liveClients = require('../library/SSE');

endpoints.add(`/api/v1/groupShoppinglist/:id`, async (request, response, session) => {
  if(!['GET', 'HEAD'].includes(request.method)){
    return 405;
  }

  if(!session.profile){
    return 403;
  }

  if(session.profile.groups.length !== 1){
    return 409;
  }

  let joinedGroup = session.profile.groups[0];
  let file = `config/groups/${joinedGroup.groupname}/shoppingLists.json`;
  let shoppingLists = [];
  try{
    shoppingLists = await fs.readFile(file, 'utf8');
  } catch(error) {
    console.log('Fehler beim auslesen der Datei',error)
    return 500;
  };
    let index;
  try{
    shoppingLists = JSON.parse(shoppingLists);
  } catch(error) {
    console.log(error);
    return 500;
  };

  for(let list of shoppingLists){
    index = list.id;

    if(request.url.endsWith(index)){
      session.shoppinglist = list;

      response.end(JSON.stringify(list));
      return;
    }
  }
  console.log(3)
  response.end();
  return;
});

endpoints.add(`/api/v1/groupShoppinglist`, async (request, response, session) => {
  if(!['GET', 'HEAD'].includes(request.method)){
    return 405;
  }

  if(!session.profile){
    return 403;
  }

  if(session.profile.groups.length !== 1){
    return 409;
  }

  let joinedGroup = session.profile.groups[0];
  let file = `config/groups/${joinedGroup.groupname}/shoppingLists.json`;
  let shoppingLists = [];
  let clickedList = session.shoppinglist;
  try{
    shoppingLists = await fs.readFile(file, 'utf8');
  } catch(error){
    console.log('Keine Datei gefunden.');
    return 500;
  }

  try{
    shoppingLists = JSON.parse(shoppingLists);
  } catch(error){
    console.log('Fehler beim parsem der Listen', error);
    return 500;
  }

  for(const list of shoppingLists){
    try{
      if(list.id === clickedList.id){
        response.end(JSON.stringify(list));
        return;
      };
    } catch(error){
      console.log(error);
      return 500;
    }
  };
  return 200;
});

endpoints.add(`/api/v1/groupShoppingList/:id`, async (request, response, session) => {
  if(!['POST', 'DELETE'].includes(request.method)){
    return 405;
  }

  if(!session.profile){
    return 403;
  }

  if(session.profile.groups.length !== 1){
    return 409;
  }

  let joinedGroup = session.profile.groups[0];
  let file = `config/groups/${joinedGroup.groupname}/shoppingLists.json`;
  let listIndex;
  let shoppingLists;
  try{
    shoppingLists = await fs.readFile(file, 'utf8');
  } catch(error) {
    console.log('Fehler beim auslesen der Datei',error)
    return 500;
  }

  try{
    shoppingLists = JSON.parse(shoppingLists);
  }catch (error) {
    console.log('Fehler beim Parsen der Einkaufslisten:', error);
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
          index = i;
          liveClients.send({
            type: 'deleteEntry',
            info: `Ein Eintrag wurde von ${session.profile.username} gelöscht.`,
            group: joinedGroup,
            content: shoppingList.entries[index],
            user: session.profile.username,
          });
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
  }
  let entry;
  try{
    entry = await new Promise((resolve, reject) => {
      let chunks = [];
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
    return 500;
  }

  let shoppingList;
  listIndex = entry.listId;
  let entries;

  for(shoppingList of shoppingLists){
    if(shoppingList.id === listIndex){
      entries = shoppingList.entries;
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
      console.log('Fehler beim speichern');
      return 500;
    }

    liveClients.send({
      type: 'entry',
      info: `Neuer Eintrag von ${session.profile.username}.`,
      content: entry,
      group: joinedGroup,
    });

  response.statusCode = 204;
  response.end();
});
