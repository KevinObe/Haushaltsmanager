'use strict';

const fs = require('node:fs/promises');

endpoints.add('/private/{index.html}?', (request, response) => {
  response.statusCode = 302;
  response.setHeader('Location', '/private/notes.html');
  response.end();
});


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

  console.log(group)
  if(savedGroups.groupname === group.groupname && savedGroups.id === group.id){
    let file = `config/groups/${group.groupname}/notes.json`;
    try{
    notes = await fs.readFile(file);
    } catch(error){
      console.log(error);
      return 500;
    }
    response.end(notes);
    console.log('passt soweit')
    return 200;
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

    } catch (error) {
      console.log(error);
      return 500;
    }
    console.log(notes[0], 'hfsfjhsdjfhsfhsdfhsdjkf')

    if(index === -1){
      notes.push(note);
    } else {
      notes[index] = note;
    }

    try{
      await fs.writeFile(file, JSON.stringify(notes, null, 2));
    } catch(error) {
      console.log(error);
      return 500;
    }
    response.end();
  }

})
