'use strict';


// include the required modules
const fs = require('node:fs');
const serve = require('../library/serve.js');


//
// GET /{index.html}?
// Add a default homepage explaining the most rudimentary basics of the server in case the user has
// not provided a custom one yet.
endpoints.add('/{index.html}?', (request, response) => {
  // this endpoint is effectively overruling the default static file delivery in case the user has
  // provided a custom index.html page, so in order to deliver our default one or the user provided
  // one we have to check if the latter is available
  fs.access('public/index.html', (error) => {
    // if no custom index.html file is available, then use our internal one, which contains a simple
    // explanation of the server
    if (error) {
      response.setHeader('Content-Type', 'text/html; charset=utf-8');
      response.end(`
        <!DOCTYPE html>
        <html lang="de">
          <head>
            <title>Startklar</title>
            <meta charset="utf-8">
          </head>
          <body>
            <h1>Startklar</h1>
            <p>Der Webserver funktioniert. Beginne nun damit eigene Dateien, darunter eine <code>index.html</code> Datei, im Verzeichnis <code>public</code> zu erstellen.</p>
            <p>Beachte auch die Konfigurationsmöglichkeiten im Ordner <code>config</code>.</p>
          </body>
        </html>
      `);

      // this endpoint has been served
      return;
    }

    // at this point we know that the user has created a custom index.html page, thus we serve that
    serve(response, 'public/index.html');
  });
});
