'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs/promises');

let directory = `config/groups`;
let file = `config/groups/groups.json`;
let group = {};

endpoints.add('/api/v1/createGroup', async (request, response, session) => {
  if (!['POST'].includes(request.method)) {
    return 405;
  }

  if(!session.profile){
    return 403;
  }

  if(session.profile.groups.length === 1){
    console.log(`${session.profile.username} ist bereits in einer Gruppe`);
    return 409;
  }
  try{
    group = await new Promise((resolve, reject) => {

      let chunks = [];
      request.on('data', (chunk) => chunks.push(chunk));
      request.on('end', () => {
        resolve(JSON.parse(Buffer.concat(chunks)));
      });
      request.on('error', (error) => {
        reject(error);
      });
    });
  } catch(error){
    console.log(error);
    return 500;
  };

  let groupname, password;

  try{
    groupname = group.groupname;
    if (!groupname) throw 'missing groupname';
    if (!groupname.match(/^[a-z0-9]+$/i)) throw 'invalid groupname';

    password = group.password;
    if (!password) throw 'missing password';
  }
  catch(error) {
    console.log(`Fehler beim erstellen der Gruppe: ${error}`);
    return 400;
  }

  groupname = groupname.trim();

  file = `config/groups/${groupname}/${groupname}.json`;

  try{
    await fs.access(file);
    if(!error){
      console.log('group allready exists!')
      return 409;
    }
  } catch(error){
    console.log(error);
  };

  group = {
    id: crypto.randomUUID(),
    groupname,
    password,
    members: [],
  };

  group.password = crypto
    .createHash('sha256')
    .update(`${group.groupname}:${group.password}`)
    .digest('hex');

  let member = {
    id: session.profile.id,
    username: session.profile.username,
  };

  let joinedGroup = {
    id: group.id,
    groupname: group.groupname,
  };

  group.members.push(member);
  session.profile.groups.push(joinedGroup);

  let newProfile = `users/${session.profile.username}/profile.json`;
  let newDir = `config/groups/${groupname}`;

  try{
    await fs.mkdir(newDir);
  } catch (error) {
    console.log(error);
    return 500;
  }

  try{
    await fs.writeFile(newProfile, JSON.stringify(session.profile, null, 2));
  }catch(error){
    console.log('Fehler beim beitreten zu der Gruppe im Profil');
    return 500;
  }

  try{
    await fs.writeFile(file, JSON.stringify(group, null, 2));
  } catch(error) {
    console.log(error);
    return 500;
  }
  response.end();
  return 200;
});
