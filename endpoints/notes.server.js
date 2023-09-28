'use strict';

const fs = require('node:fs/promises');

endpoints.add('/api/v1/notes', async (request, response, session) => {
  if(!['GET', 'HEAD'].includes(request.method)) {
    return 405;
  }

  if(!session.profile){
    return 403;
  }
  try{
    const data = await fs.readFile(`users/${session.profile.username}/notes.json`, 'utf8');
    response.end(data);
    return 200;
  } catch (error){
    if(error){
      return 500;
    }
  }
});


endpoints.add('/api/v1/notes/:id', async (request, response, session, match) => {
  const file = `users/${session.profile.username}/notes.json`;
  let notes = [];
  let note = {};
  if(!['POST', 'DELETE'].includes(request.method)){
    return 405;
  }

  if(!session.profile){
    return 403;
  }

  const size = parseInt(request.headers['content-length']);
  if (request.method === 'POST' && isNaN(size) || size > 1000) {
    return 413;
  }

  try{
    const data = await fs.readFile(file, 'utf8');
    try{
      notes = await JSON.parse(data);
    }
    catch(error){
      console.log('Fehler beim Parsen der Notizen:', error);
      return 500;
    }
  } catch(error){
    console.log('Fehler beim Lesen der Datei:', error);
    return 500;
  }

  const index = await notes.findIndex((note) => note.id === match.pathname.groups.id);

  if(request.method === 'DELETE'){
    if(index === -1){
      return 404;
    }
    notes.splice(index, 1);

    try{
      await fs.writeFile(file, JSON.stringify(notes, null, 2));
    } catch(error){
      console.log('Fehler beim löschen', error);
      return 500;
    }
    response.end();
    return 204;
    }

  try{
    note = await new Promise((resolve, reject) => {

      let chunks = [];
      request.on('data', (chunk) => chunks.push(chunk));
      request.on('end', () => {
        resolve(JSON.parse(Buffer.concat(chunks)));
      });
      request.on('error', (error) => {
        reject(error);
      });
    });
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
    return 500;
  }

  if (index === -1) {
    notes.push(note);
  } else {
    notes[index] = note;
  }

  try{
    await fs.writeFile(file, JSON.stringify(notes, null, 2));
  } catch(error) {
    return 500;
  };
    response.end();
    return 204;
});
