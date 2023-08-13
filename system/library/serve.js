'use strict';


// include the required modules
const fs = require('node:fs');
const path = require('node:path/posix');
const mimetypes = require('../library/mimetypes.json');


//
// serve()
// Read the given file and respond it with the proper mimetype to the client.
// <- response: ServerResponse
// <- file: String
function serve(response, file) {
  // if the path of the file just ends with a slash sign then we use the `index.html` file as the
  // default file to serve to the user
  if (file.endsWith('/')) {
    file += 'index.html';
  }

  // read the requested file from disk
  fs.readFile(file, (error, data) => {
    // if an error occured, which is usually either because the file does not exist, the target is a
    // directory or we do not have read permissions, then we just handle it like the file does not
    // exist
    if (error) {
      response.statusCode = 404;
      response.end('404 Not Found');
      return;
    }

    // extract the mimetype to use based on the extension of the requested file and add it as header
    // to the response, if a mimetype could be read from the collection of known mimetypes
    const mimetype = mimetypes[path.extname(file)];
    if (mimetype) {
      response.setHeader('Content-Type', mimetype);
    }

    // finally send the contents of the file back to the user
    response.end(data);
  });
};


// export only the serve method, as we do not have to offer anything else
module.exports = serve;
