'use strict';

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

  fs.readFile(`users/${session.profile.username}/shoppinglist.json`, (error, data) => {
    response.setHeader('Content-Type', 'application/json');

    if(error){
      response.end(JSON.stringify([
        {
          id:'fcd04f12-0786-4c34-baca-8f60e5d3a4c4',
          text: 'erster Eintrag!',
        }
      ]));

      return;
    }

    response.end(data);
  });
});

endpoints.add('/api/v1/shoppinglist/:id', (request, response, session, match) => {
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

  const file = `users/${session.profile.username}/shoppinglist.json`;
  fs.readFile(file, 'utf8', (error, data) => {
    let entries = [];

    if(!error){
      try{
        entries = JSON.parse(data);
      }
      catch(error){
        console.log('Fehler beim Parsen der Einträge:', error);
        response.statusCode = 500;
        response.end();
        return;
      }
    }

    const index = entries.findIndex((entry) => entry.id === match.pathname.groups.id);

    if(request.method === 'DELETE'){
      if(index === -1){
        response.statusCode = 404;
        response.end();
        return;
      }

      entries.splice(index, 1);

      fs.writeFile(file, JSON.stringify(entries, null, 2), (error) => {
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

    let body = '';
    request.on('data', (chunk) => body += chunk);
    request.on('end', () => {
      let entry;

      try{
        entry = JSON.parse(body);

        if(typeof entry !== 'object') throw 'entries are no objects';

        if(entry.id === undefined) throw 'missing id';
        if(
          typeof entry.id !== 'string' || !entry.id.match(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/)
        ) throw 'invalid id';

        if(entry.text === undefined) throw 'missing text key';
        if (typeof entry.text !== 'string') throw 'invalid text key';
        if (entry.text.length > 512) throw 'text key is too long';

        if (Object.keys(entry).length !== 2) throw 'too many keys';
      }
      catch(error){
        console.log('Fehler beim parsen der Einträge', error);
        response.statusCode = 400;
        response.end();
        return;
      }

      if (index === -1) {
        entries.push(entry);
      } else {
        entries[index] = entry;
      }

      fs.writeFile(file, JSON.stringify(entries, null, 2), (error) => {
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
