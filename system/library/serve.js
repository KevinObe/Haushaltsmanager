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
// <- placeholders: Object?
function serve(response, file, placeholders = null) {
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

    // check if placeholders are given, so we can iterate over them and insert their values
    if (placeholders) {
      // convert the data into a string (beware, that using placeholders in combination with binary
      // data is not a good idea as it damages the file due to the conversion)
      data = data.toString();

      // iterate over all placeholders and insert them into the files
      for (const [ placeholder, value ] of Object.entries(placeholders)) {
        data = data.replaceAll(placeholder, value);
      }
    }

    // finally send the contents of the file back to the user
    response.end(data);
  });
};


//
// serve.default()
// Serve the given file if it exists in the custom folders `public` or `private` or use the system
// supplied default file for it from the `system/public` and `system/private` folders.
// <- response: ServerResponse
// <- file: String
// <- placeholders: Object?
serve.default = function(response, userCustomFile, placeholders) {
  // build the path to the system default file location
  const systemDefaultFile = path.join('system', userCustomFile);

  // check if the user custom file does exist
  fs.access(userCustomFile, (error) => {
    // the custom file of the user could not be found so we serve the system default file instead
    if (error) {
      serve(response, systemDefaultFile, placeholders);
      return;
    }

    // at this point we know that the user custom file does exist, so we serve it
    serve(response, userCustomFile, placeholders);
  });
};


// export only the serve method, as we do not have to offer anything else
module.exports = serve;
