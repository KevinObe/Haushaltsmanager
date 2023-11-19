'use strict';

const serve = require('../system/library/serve.js');
const twoWeeksInSeconds = 1209600;

endpoints.add('/public/image.background.(jpg|png)', async (request, response, session) => {
  if(request.method !== 'GET'){
    return 405;
  };

  try{
    response.setHeader('Cache-Control', `max-age=${twoWeeksInSeconds}`);
    serve(response, 'public/image.background.jpg');
  } catch(error){
    console.log(error);
    response.end('Fehler beim Laden der Datei.');
    return 500;
  }
});

endpoints.add('/private/image.background.(jpg|png)', async (request, response, session) => {
  if(request.method !== 'GET'){
    return 405;
  };

  try{
    response.setHeader('Cache-Control', `max-age=${twoWeeksInSeconds}`);
    serve(response, 'private/image.background.jpg');
  } catch(error){
    console.log(error);
    response.end('Fehler beim Laden der Datei.');
    return 500;
  }
});
