'use strict';

const fs = require('node:fs/promises');
const path = require('path');

let cachedImg;

endpoints.add('/api/v1/cachedImg', async (request, response, session) => {
  if(request.method !== 'GET'){
    return 405;
  };

  const imgPath = `coffee-concept-with-differents-types-coffee-coffee-beans-milk-cinnamon-sticks-grey-background-flat-lay copy.jpg`;

  try{
    const img = await fs.readFile(imgPath, 'utf8');
    const twoWeeksInSeconds = 60;
    response.setHeader('Cache-Control', `public, max-age=${twoWeeksInSeconds}`);
    response.setHeader('Content-Type', 'image/jpeg');
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.end(img);
  } catch(error){
    console.log(error);
    response.end('Fehler beim Laden der Datei.');
    return 500;
  }

});
