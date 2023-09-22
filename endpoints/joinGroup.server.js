'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');

let groupname, password;

endpoints.add('/api/v1/joinGroup', (request, response, session) => {
  if(!['POST'].includes(request.method)) {
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

  let group;
  let savedGroup;
  let body = '';
  request.on('data', (chunk) => body += chunk);
  request.on('end', () => {
    try{
    group = JSON.parse(body);
    } catch (error) {
      console.log('Fehler beim beitreten');
      response.statusCode = 500;
      response.end('500 internal server error.');
      return;
    }

    groupname = group.groupname.trim();

    let file = `config/groups/${groupname}/${groupname}.json`;

    fs.readFile(file, (error, data) => {
      if(error){
        console.log('Gruppe nicht gefunden');
        response.statusCode = 500;
        response.end('500 internal server error.');
        return;
      }

      try{
        savedGroup = JSON.parse(data);
      } catch (error) {
        console.log('Fehlere beim parsen der Gruppen.');
        response.statusCode = 500;
        response.end('500, internal server error.');
        return;
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
            response.statusCode = 409;
            response.end('409, user is allready a member of the group.');
            return;
          }
        }

        savedGroup.members.push(member);
        session.profile.groups.push(joinedGroup);

        fs.writeFile(file, JSON.stringify(savedGroup, null, 2), (error) => {
          if(error){
            console.log('Fehler beim speichern des Mitglieds.', error)
            response.statusCode = 500;
            response.end('500, internal server error.');
            return;
          }

          file = `users/${session.profile.username}/profile.json`;
          fs.writeFile(file, JSON.stringify(session.profile, null, 2), (error) => {
            if(error){
              console.log('Fehler beim speichern des Profils.', error)
              response.statusCode = 500;
              response.end('500, internal server error.');
              return;
            }

          response.statusCode = 204;
          response.end();
          return;
          });
        response.statusCode = 204;
        response.end();
        return;
        });
      } else {
        console.log('Falsche Zugangsdaten.');
        response.statusCode = 409;
        response.end('409, Wrong groupname or password');
        return;
      };
    }); //readFile
  });
})//endpoint
