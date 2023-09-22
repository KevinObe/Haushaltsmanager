'use strict';

const fs = require('node:fs');

let file = '';
let group = {};
let joinedGroup = {};

endpoints.add('/api/v1/groupShoppingLists', (request, response, session) => {
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
    response.statusCode = 400;
    response.end();
    return;
  }

  joinedGroup = session.profile.groups[0];
  file = `config/groups/${joinedGroup.groupname}/${joinedGroup.groupname}.json`;
  fs.readFile(file, (error, data) => {
    if(error){
      response.statusCode = 500;
      response.end();
      return;
    }

    try{
      group = JSON.parse(data);
    } catch(error){
      console.log('Fehler beim parsen der Datei.');
    }
    console.log('passt')

    if(joinedGroup.groupname === group.groupname &&  joinedGroup.id === group.id){
      file = `config/groups/${joinedGroup.groupname}/shoppingLists.json`;
      fs.readFile(file, (error, data) => {
        if(error){
          console.log('no file')
          return;
        }
      console.log('aui')
      response.end(data);
      });
    };
  });
});

endpoints.add(`/api/v1/groupShoppingLists/:id`, (request, response, session, match) => {
  console.log('request')
  joinedGroup = session.profile.groups[0];
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
    response.statusCode = 400;
    response.end();
    return;
  }

  const size = parseInt(request.headers['content-length']);
  if (request.method === 'POST' && isNaN(size) || size > 1000) {
    response.statusCode = 413;
    response.end('413 Payload Too Large');
    return;
  }

  if(joinedGroup.groupname === group.groupname &&  joinedGroup.id === group.id){
    console.log('passtiii', joinedGroup)
    file = `config/groups/${joinedGroup.groupname}/shoppingLists.json`;

    fs.readFile(file, 'utf8', (error, data) => {
    let shoppingLists = [];

    if(!error){
      try{
        shoppingLists = JSON.parse(data);
      }
      catch(error){
        console.log('Fehler beim Parsen der Einkaufslisten:', error);
        response.statusCode = 500;
        response.end();
        return;
      }
    }

    if(error){
      fs.writeFile(file, JSON.stringify(shoppingLists, null, 2), (error) => {
        if(error){
          console.log('Fehler beim erstellen der Datei.', error);
          response.statusCode = 500;
          response.end('500, Internal server error.');
          return;
        }
        return;
      })
    }

    const index = shoppingLists.findIndex((shoppingList) => shoppingList.id === match.pathname.groups.id);

    if(request.method === 'DELETE'){
      if(index === -1){
        response.statusCode = 404;
        response.end();
        return;
      }

      shoppingLists.splice(index, 1);

      fs.writeFile(file, JSON.stringify(shoppingLists, null, 2), (error) => {
        console.log(2)
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
      let shoppingList;

      try{
        shoppingList = JSON.parse(body);

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
        response.statusCode = 400;
        response.end();
        return;
      }

      if (index === -1) {
        shoppingLists.push(shoppingList);
      } else {
        shoppingLists[index] = shoppingList;
      }

      fs.writeFile(file, JSON.stringify(shoppingLists, null, 2), (error) => {
        if(error){
          response.statusCode = 500;
          response.end('Fehler');
          return;
        }

        response.statusCode = 204;
        response.end();
      });
    });
  })};
});
