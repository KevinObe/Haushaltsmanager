'use strict';

const fs = require('node:fs');

let shoppingList = {};

endpoints.add('/{ìndex.html}?', (request, response) => {
  response.statusCode = 302;
  response.setHeader('Location', '/login.html');
  response.end();
});

endpoints.add('/private/{index.html}?', (request, response) => {
  response.statusCode = 302;
  response.setHeader('Location', '/private/shopping.html');
  response.end();
});

endpoints.add('/api/v1/shoppingList', (request, response, session) => {
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

  let path = `users/${session.profile.username}/`;

  fs.readdir(path, (error, files) => {

    if(error){
      response.end(JSON.stringify([
        {
          id:'ba61cb27-695c-4879-b8af-4688d507d1e4',
          title: 'Erste Einkaufsliste',
          listEntries: [],
        }
      ]));
      console.log('sent this answer');
      return;
    }

  });
});

endpoints.add('/api/v1/shoppingList/:id', (request, response, session, match) => {
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

  const size = parseInt(request.headers['content-length']);
  if (request.method === 'POST' && isNaN(size) || size > 1000) {
    response.statusCode = 413;
    response.end('413 Payload Too Large');
    return;
  }

  let file = `users/${session.profile.username}/shoppingList/:id.json`;
  fs.readFile(file, 'utf8', (error, data) => {
    let shoppingList = {};

    if(!error){
      try{
        shoppingList = JSON.parse(data);
        console.log(shoppingList)
      }
      catch(error){
        console.log('Fehler beim Parsen der Liste:', error);
        response.statusCode = 500;
        response.end();
        return;
      }
    }
/*
    if(request.method === 'DELETE'){
      fs.writeFile(file, JSON.stringify(shoppingList.id, null, 2), (error) => {
        if(error){
          response.statusCode = 500;
          response.end();
          return;
        }

        response.statusCode = 204;
        response.end('Fehler');
      });
      return;
    }
*/

    let body = '';
    request.on('data', (chunk) => body += chunk);
    request.on('end', () => {
      shoppingList;

      try{
        shoppingList = JSON.parse(body);

        if(typeof shoppingList !== 'object') throw 'lists are no objects';

        if(shoppingList.id === undefined) throw 'missing id';
        if(
          typeof shoppingList.id !== 'string' || !shoppingList.id.match(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/)
        ) throw 'invalid id';

        if(shoppingList.listEntries === undefined) throw 'missing text key';
        //if (typeof shoppingList.text !== 'array') throw 'invalid text key';
        if (shoppingList.listEntries.length > 512) throw 'text key is too long';

        if (Object.keys(shoppingList).length !== 3) throw 'too many keys';
      }
      catch(error){
        console.log('Fehler beim parsen der Einkauflisten', error);
        response.statusCode = 400;
        response.end();
        return;
      }
/*
      if (index === -1) {
        shoppingLists.push(shoppingList);
      } else {
        shoppingLists[index] = shoppingList;
      }
*/
      file = `users/${session.profile.username}/${shoppingList.id}.json`;
      fs.writeFile(file, JSON.stringify(shoppingList, null, 2), (error) => {
        if(error){
          console.log(shoppingList.id)
          response.statusCode = 500;
          response.end();
          return;
        }

        response.statusCode = 204;
        response.end();
      });
    });
  });
});
