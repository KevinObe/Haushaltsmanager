'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const liveClients = require('../library/SSE');

let groupname, password;

endpoints.add('/api/v1/joinGroup', async (request, response, session) => {
  if(!['POST'].includes(request.method)) {
    return 405;
  }

  if(!session.profile){
    return 403;
  }

  const size = parseInt(request.headers['content-length']);
  if (isNaN(size) || size > 1000) {
    return 413;
  };

  if(session.profile.groups.length === 1){
    console.log(`${session.profile.username} ist bereits in einer Gruppe`);
    response.end('409 Conflict');
    return 409;
  }

  let group;
  let savedGroup;

  let chunks = [];
  try{
    group = await new Promise((resolve, reject) => {
      request.on('data', (chunk) => chunks.push(chunk));
      request.on('end', () => {
        resolve(JSON.parse(Buffer.concat(chunks)));
      });
      request.on('error', () => {
        reject(error);
      });
    });
    if(group.groupname === '' || group.password === undefined) throw 'No valid groupname!';
    if(group.password === '' || group.password === undefined) throw 'No valid password!';
    if(typeof group !== 'object') throw 'No valid group data!';
    if(Object.keys(group).length !== 2) throw 'too many keys!';
  } catch(error) {
    console.log('Fehler beim beitreten', error);
    return 500;
  }

  groupname = group.groupname.trim();

  let file = `config/groups/${groupname}/${groupname}.json`;

  try{
    savedGroup = await fs.readFile(file, 'utf8');
  } catch(error) {
    console.log('Gruppe nicht gefunden');
    return 500;
  }

  try{
    savedGroup = JSON.parse(savedGroup);
  } catch (error) {
    console.log('Fehlere beim parsen der Gruppen.');
    return 500;
  }

  password = group.password;

  password = crypto
    .createHash('sha256')
    .update(`${group.groupname}:${group.password}`)
    .digest('hex');

    if(savedGroup.groupname === groupname && savedGroup.password === password){
      let member = {
      id: session.profile.id,
      username: session.profile.username,
    };

    let joinedGroup = {
      id: savedGroup.id,
      groupname: savedGroup.groupname,
    }

    for(let i = 0; i < savedGroup.members.length; i++){
      if(savedGroup.members[i].id === member.id && savedGroup.members[i].username === member.username){
        console.log(`${member.username} ist bereits in der Gruppe ${savedGroup.groupname}`);
        response.end('409, user is allready a member of the group.');
        return 409;
      }
    }

    savedGroup.members.push(member);
    session.profile.groups.push(joinedGroup);

    try{
      await fs.writeFile(file, JSON.stringify(savedGroup, null, 2));
      file = `users/${session.profile.username}/profile.json`;
      await fs.writeFile(file, JSON.stringify(session.profile, null, 2));
    } catch(error) {
      console.log('Fehler beim speichern!', error)
      response.end('500, internal server error.');
      return 500;
    }

    liveClients.send({
      type: 'online',
      info: `${session.profile.username} ist der Gruppe beigetreten.`,
      group: joinedGroup,
    });

    response.statusCode = 204;
    response.end();
    return;
  };
});
