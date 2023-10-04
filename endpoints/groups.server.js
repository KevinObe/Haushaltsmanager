'use strict';

const fs = require('node:fs/promises');

endpoints.add('/api/v1/checkGroup', async (request, response, session) => {
  if(session.profile.groups.length === 1){
    response.end(JSON.stringify(session.profile.groups[0]));
    return 200;
  }
  console.log('nope');
  response.end();
  return 500;
});

endpoints.add('/api/v1/leaveGroup', async (request, response, session) => {
  if(request.method !== 'DELETE'){
    return 405;
  };

  if(!session.profile){
    return 403;
  };

  const size = parseInt(request.headers['content-length']);
  if (request.method === 'DELETE' && isNaN(size) || size > 1000) {
    return 413;
  };

  if(session.profile.groups.length < 1){
    return 400;
  };

  let joinedGroup;
  try{
    joinedGroup = await new Promise((resolve, reject) => {

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

  if(joinedGroup.groupname === session.profile.groups[0].groupname && joinedGroup.id === session.profile.groups[0].id) {
    const file = `config/groups/${joinedGroup.groupname}/${joinedGroup.groupname}.json`;
    let savedGroup;
    try{
      savedGroup = await fs.readFile(file, 'utf8');
      savedGroup = await JSON.parse(savedGroup);
    } catch (error){
      return 500;
    };

    let index = savedGroup.members.findIndex((member) => member.id === session.profile.id);

    if(index === -1){
      return 404;
    };

    savedGroup.members.splice(index, 1);
    session.profile.groups.splice(0, 1);
    try{
      await fs.writeFile(file, JSON.stringify(savedGroup, null, 2));
    } catch (error){
      console.log(error);
      return 500;
    };

    try{
      await fs.writeFile(`users/${session.profile.username}/profile.json`, JSON.stringify(session.profile, null, 2));
    } catch (error){
      console.log(error);
      return 500;
    };

    if(savedGroup.members.length === 0){
      let dir = `config/groups/${savedGroup.groupname}`;
      try{
        await fs.rm(dir, { recursive: true});
        console.log('removed the groups directory.');
      } catch (error){
        console.log(error, 'error while removing group directory.');
        return 500;
      };
    };

    response.end();
    return 204;
  }
  response.end();
  return;
});
