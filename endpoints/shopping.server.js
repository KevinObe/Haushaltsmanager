'use strict';

const fs = require('node:fs');

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

endpoints.add('/api/v1/shoppingLists', (request, response, session) => {
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

  fs.readFile(`users/${session.profile.username}/shoppingLists.json`, (error, data) => {
    response.setHeader('Content-Type', 'application/json');

    if(error){
      response.end(JSON.stringify([
        {
          id:'fcd04f12-0786-4c34-baca-8f60e5d3a4c6',
          title: 'Beispiel Einkaufsliste',
        }
      ]));

      return;
    }

    response.end(data);
  });
});

endpoints.add('/api/v1/shoppingLists/:id', (request, response, session, match) => {
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

  const file = `users/${session.profile.username}/shoppingLists.json`;
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

    const index = shoppingLists.findIndex((shoppingList) => shoppingList.id === match.pathname.groups.id);

    if(request.method === 'DELETE'){
      if(index === -1){
        response.statusCode = 404;
        response.end();
        return;
      }

      shoppingLists.splice(index, 1);

      fs.writeFile(file, JSON.stringify(shoppingLists, null, 2), (error) => {
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
  });
});
