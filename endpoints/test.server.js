'use strict';
const serverLists = require('./test.2.server.js');
const fs = require('node:fs');

endpoints.add(`/api/v1/shoppinglist/:id`, (request, response, session, match) => {
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
  console.log(request.url)
  let file = `users/${session.profile.username}/shoppingLists.json`
  fs.readFile(file, (error, data) => {
    if(error){
      console.log('Fehler beim auslesen der Datei',error)
      response.end();
      return;
    }
    let index;
    let shoppingLists = JSON.parse(data);
    for(const list of shoppingLists){
      index = list.id;

      if(request.url.endsWith(index)){
        console.log('gotcha')
        module.exports.id = list.id;
        module.exports.title = list.title;
        module.exports.entries = list.entries;

        response.setHeader('Location', '/private/shopping.html');
        response.end(JSON.stringify(list));
        return;
      }
    }
    response.end(data);
    return;
  })
});
