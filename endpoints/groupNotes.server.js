'use strict';

const fs = require('node:fs/promises');
const liveClients = require('../library/SSE');

let notes = [];
let savedGroups;

endpoints.add(`/api/v1/groupNotes`, async (request, response, session) => {
  if(!['GET', 'HEAD'].includes(request.method)) {
    return 405;
  }

  if(!session.profile){
    return 403;
  }

  if(session.profile.groups.length < 1){
    return 409;
  }
  let group = session.profile.groups[0];
  console.log(2)
  try{
    let file = `config/groups/${group.groupname}/${group.groupname}.json`;
    savedGroups = await fs.readFile(file, 'utf8');
    savedGroups = await JSON.parse(savedGroups);
    console.log(savedGroups)
  } catch(error){
    return 500;
  }

  if(savedGroups.groupname === group.groupname && savedGroups.id === group.id){
    let file = `config/groups/${group.groupname}/notes.json`;
    let errorFile =
      [
        {
        "id": "23d874c6-732e-4359-b96f-e8bbee13a4c4",
        "text": "Beispiel für eine Notiz",
        "done": false
        }
      ];
    try{
    notes = await fs.readFile(file);
    response.end(notes);
    return 200;
    } catch(error){
      await fs.writeFile(file, JSON.stringify(errorFile, null, 2));
      console.log('Datei erstellt.');
      response.end(JSON.stringify(
        [
          {
          "id": "23d874c6-732e-4359-b96f-e8bbee13a4c4",
          "text": "Beispiel für eine Notiz",
          "done": false
          }
        ]
      ));
    }
  }
});

endpoints.add(`/api/v1/groupNotes/:id`, async (request, response, session) => {
  if(!['POST', 'DELETE'].includes(request.method)){
    return 405;
  }
  let group = session.profile.groups[0];

  if(!session.profile){
    return 403;
  }

  if(session.profile.groups.length < 1){
    return 409;
  }

  const size = parseInt(request.headers['content-length']);
  if (request.method === 'POST' && isNaN(size) || size > 1000) {
    return 413;
  }

  let file = `config/groups/${group.groupname}/${group.groupname}.json`;
  try{
    savedGroups = await fs.readFile(file, 'utf8');
    savedGroups = JSON.parse(savedGroups)
  } catch(error){
    return 500;
  }

  if(savedGroups.groupname === group.groupname && savedGroups.id === group.id){
    let notes = [];
    let note = {};
    file = `config/groups/${group.groupname}/notes.json`;
    try{
      let savedNotes = await fs.readFile(file, 'utf8');
      notes = await JSON.parse(savedNotes);
    } catch (error){
      console.log(error);
    }

    let reqId = request.url.split('/');
    console.log(reqId[4]);
    let index  = notes.findIndex((note) => note.id === reqId[4]);
    console.log(index)

    if(request.method === 'DELETE'){
      if(index === -1){
        response.end();
        return 404;
      }

      liveClients.send({
        type: 'deleteTodo',
        info: `${session.profile.username} hat eine To Do gelöscht.`,
        content: notes[index],
        user: session.profile.username,
        group: group,
      });

      notes.splice(index, 1);
      try{
        await fs.writeFile(file, JSON.stringify(notes, null, 2));
          } catch (error){
            console.log(error)
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

    } catch (error) {
      console.log(error);
      return 500;
    }

    if(index === -1){
      notes.push(note);
      liveClients.send({
        type: 'ToDo',
        info: `${session.profile.username} hat eine To Do erstellt.`,
        content: note,
        group: group,
      });
    } else {
      notes[index] = note;
      if(note.done){
        liveClients.send({
          type: 'checked',
          info: `${session.profile.username} hat eine To Do erledigt.`,
          user: session.profile.username,
          content: note,
          group: group,
        });
      }
       if(!note.done){
        liveClients.send({
          type: 'checked',
          info: `${session.profile.username} hat eine To Do erstellt.`,
          user: session.profile.username,
          content: note,
          group: group,
        });
       }
    }

    try{
      await fs.writeFile(file, JSON.stringify(notes, null, 2));
    } catch(error) {
      console.log(error);
      return 500;
    }

    response.statusCode = 204;
    response.end();
    return;
  }
})
