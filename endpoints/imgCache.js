'use strict';

const path = require('node:path');
const serve = require('../system/library/serve.js');
const twoWeeksInSeconds = 1209600;

//stores the background image for the public directory in the cache for faster website loading.
endpoints.add('/public/image.background.(jpg|png)', async (request, response) => {
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

//stores the background image for the private directory in the cache for faster website loading.
endpoints.add('/private/image.background.(jpg|png)', async (request, response) => {
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

//store all icons from the images folder in the cache for faster website loading.
endpoints.add('/private/images/(.png)', async (request, response) => {
  if(request.method !== 'GET'){
    return 405;
  };

  const url = new URL(request.url, 'http://127.0.0.1');
  const file = path.join('private/images', url.pathname);

  try{
    response.setHeader('Cache-Control', `max-age=${twoWeeksInSeconds}`);
    serve(response, file);
  } catch(error){
    console.log(error);
    response.end('Fehler beim Laden der Datei.');
    return 500;
  }
});
