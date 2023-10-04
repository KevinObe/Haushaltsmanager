'use strict';

const fs = require('node:fs/promises');

let file = '';
let group = {};
let joinedGroup = {};

endpoints.add('/api/v1/groupShoppingLists', async (request, response, session) => {
  if(!['GET', 'HEAD'].includes(request.method)){
    return 405;
  }

  if(!session.profile){
    return 403;
  }

  if(session.profile.groups.length < 1){
    return 400;
  }

  joinedGroup = session.profile.groups[0];
  file = `config/groups/${joinedGroup.groupname}/${joinedGroup.groupname}.json`;
  try{
    const data = await fs.readFile(file, 'utf8');
    group = await JSON.parse(data);
  } catch(error){
    console.log('Fehler beim parsen der Datei.');
    return 500;
  };
  console.log(group)

  if(joinedGroup.groupname === group.groupname &&  joinedGroup.id === group.id){

    file = `config/groups/${joinedGroup.groupname}/shoppingLists.json`;
    let errorFile =
    [
      {
        "id": "6681fad1-94b3-4eb1-921d-44240d7280a6",
        "title": "Beispiel Einkaufsliste",
        "entries":
        [
          {
            "id": "e31fd65c-1426-4fde-9efb-66ca1e40dd40",
            "text": "Beispiel Eintrag",
            "listId": "6681fad1-94b3-4eb1-921d-44240d7280a6"
          }
        ]
      }
    ];
    let data;
    try{
      data = await fs.readFile(file, 'utf8');
      console.log(data)
    } catch(error) {
      await fs.writeFile(file, JSON.stringify(errorFile, null, 2));
      console.log('Datei erstellt.');
      response.end(JSON.stringify(
      [
        {
          "id": "6681fad1-94b3-4eb1-921d-44240d7280a6",
          "title": "Beispiel Einkaufsliste",
          "entries":
          [
            {
              "id": "e31fd65c-1426-4fde-9efb-66ca1e40dd40",
              "text": "Beispiel Eintrag",
              "listId": "6681fad1-94b3-4eb1-921d-44240d7280a6"
            }
          ]
        }
      ]
      ));
    };
    response.end(data);
  };
});

endpoints.add(`/api/v1/groupShoppingLists/:id`, async (request, response, session, match) => {
  joinedGroup = session.profile.groups[0];
  if(!['POST', 'DELETE'].includes(request.method)){
    return 405;
  }

  if(!session.profile){
    return 403;
  }

  if(session.profile.groups.length < 1){
    return 400;
  }

  const size = parseInt(request.headers['content-length']);
  if (request.method === 'POST' && isNaN(size) || size > 1000) {
    return 413;
  }
  let shoppingLists = [];
  if(joinedGroup.groupname === group.groupname &&  joinedGroup.id === group.id){
    file = `config/groups/${joinedGroup.groupname}/shoppingLists.json`;
    try{
      const data = await fs.readFile(file, 'utf8');
      shoppingLists = JSON.parse(data);
    } catch(error) {
      console.log('Fehler beim Parsen der Einkaufslisten:', error);
      try{
        await fs.writeFile(file, JSON.stringify(shoppingLists, null, 2));
      } catch(error) {
        console.log('Fehler beim erstellen der Datei.', error);
        return 500;
      };
    };
  };

  const index = shoppingLists.findIndex((shoppingList) => shoppingList.id === match.pathname.groups.id);

  if(request.method === 'DELETE'){
    if(index === -1){
      return 404;
    }

    shoppingLists.splice(index, 1);

    try{
      await fs.writeFile(file, JSON.stringify(shoppingLists, null, 2));
      response.end();
      return 204;
    } catch(error) {
      response.end();
      return 500;
    }
  };

  let chunks = [];
  let shoppingList;
  try{
      shoppingList = await new Promise((resolve, reject) => {
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
    return 500;
  };

  try{
    if(typeof shoppingList !== 'object') throw 'lists are no objects';

    if(shoppingList.id === undefined) throw 'missing id';
    if(
      typeof shoppingList.id !== 'string' || !shoppingList.id.match(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/)
    ) throw 'invalid id';

    if(shoppingList.entries === undefined) throw 'missing text key';
    //if (typeof shoppingList.text !== 'array') throw 'invalid text key';
    if (shoppingList.entries.length > 512) throw 'text key is too long';

    if (Object.keys(shoppingList).length !== 3) throw 'too many keys';
  }
  catch(error){
    console.log('Fehler beim parsen der Einkauflisten', error);
    return 400;
  }

  if (index === -1) {
    shoppingLists.push(shoppingList);
  } else {
    shoppingLists[index] = shoppingList;
  }

  try{
    await fs.writeFile(file, JSON.stringify(shoppingLists, null, 2));
  } catch (error){
    console.log(error);
    return 500;
  }
  response.statusCode = 204;
  response.end();
});
