'use strict';

const fs = require('node:fs');

endpoints.add('/api/v1/notes', (request, response, session) => {
  if(!['GET', 'HEAD'].includes(request.method)) {
    response.statusCode = 405;
    response.end();
    return;
  }

  if(!session.profile){
    response.statusCode = 403;
    response.end();
    return;
  }

  fs.readFile(`users/${session.profile.username}/notes.json`, (error, data) => {
    response.setHeader('Content-Type', 'application/json');

    if(error){
      response.end(JSON.stringify([
        {
          id: 'fcd04f12-0786-4c34-baca-8f60e5d3a4c8',
          text: 'Meine erste Notiz',
        }
      ]));

      return;
    }

    response.end(data);
  });
});

endpoints.add('/api/v1/notes/:id', (request, response, session, match) => {
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

  const file = `users/${session.profile.username}/notes.json`;
  fs.readFile(file, 'utf8', (error, data) => {
    let notes = [];

    if(!error){
      try{
        notes = JSON.parse(data);
      }
      catch(error){
        console.log('Fehler beim Parsen der Notizen:', error);
        response.statusCode = 500;
        response.end();
        return;
      }
    }

    const index = notes.findIndex((note) => note.id === match.pathname.groups.id);

    if(request.method === 'DELETE'){
      if(index === -1){
        response.statusCode = 404;
        response.end();
        return;
      }

      notes.splice(index, 1);

      fs.writeFile(file, JSON.stringify(notes, null, 2), (error) => {
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
      let note;

      try{
        note = JSON.parse(body);

        if(typeof note !== 'object') throw 'notes are no object';

        if(note.id === undefined) throw 'missing id';
        if(
          typeof note.id !== 'string' || !note.id.match(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/)
        ) throw 'ivalid id';

        if (note.text === undefined) throw 'missing text key';
        if (typeof note.text !== 'string') throw 'invalid text key';
        if (note.text.length > 512) throw 'text key is too long';

        if (Object.keys(note).length !== 3) throw 'too many keys';
      }
      catch(error){
        console.log('Fehler beim parsen der Notizen', error);
        response.statusCode = 400;
        response.end();
        return;
      }

      if (index === -1) {
        notes.push(note);
      } else {
        notes[index] = note;
      }

      fs.writeFile(file, JSON.stringify(notes, null, 2), (error) => {
        if(error){
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
