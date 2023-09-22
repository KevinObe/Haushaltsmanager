'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');

let directory = `config/groups`;
let file = `config/groups/groups.json`;
let group = {};

fs.mkdirSync(directory, { recursive: true });


endpoints.add('/api/v1/createGroup', (request, response, session) => {
  if (!['POST'].includes(request.method)) {
    response.statusCode = 405;
    response.end('405 Method Not Allowed');
    return;
  }

  if(!session.profile){
    response.statusCode = 403;
    response.end();
    return;
  }

  if(session.profile.groups.length === 1){
    console.log(`${session.profile.username} ist bereits in einer Gruppe`);
    response.statusCode = 409;
    response.end('409 Conflict');
    return;
  }

  let body = '';
  request.on('data', (chunk) => body += chunk);
  request.on('end', () => {
    group = JSON.parse(body);

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
      response.statusCode = 400;
      response.end('400 Bad Request');
      return;
    }

    groupname = groupname.trim();

    file = `config/groups/${groupname}/${groupname}.json`;

    fs.access(file, (error) => {
      if (!error) {
        console.log('group allready exists!')
        response.statusCode = 409;
        response.end('409 Conflict');
        return;
      }

      const group = {
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

        fs.mkdir(newDir, (error) => {
          if(error){
            response.statusCode = 500;
            response.end('500');
            return;
          }
        })

        fs.writeFile(newProfile, JSON.stringify(session.profile, null, 2), (error) => {
          if(error){
            console.log('Fehler beim beitreten zu der Gruppe im Profil');
            response.statusCode = 500;
            response.end('500 internal server error.');
            return;
          }

          fs.writeFile(file, JSON.stringify(group, null, 2), (error) => {
            if (error) {
              response.statusCode = 500;
              response.end('500 Internal Server Error');
              return;
            }

          response.statusCode = 204;
          response.end();
          return;
        }); //writeFile
      }); //writeFile
    }); //fs.access
  }); //body request.on
}); //endpoint
