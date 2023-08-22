'use strict';


// include the required modules
const fs = require('node:fs');
const URLPattern = require('../library/urlpattern.js');


//
// endpoints: Array<URLPattern>
// Collection of all registered endpoints.
const endpoints = [];


//
// add()
// <- pathname: String
// <- serve: Function
endpoints.add = (pathname, serve) => {
  // check the types and values of the parameters to ensure we only collect valid endpoints
  if (typeof pathname !== 'string') throw new TypeError('Endpoint pathname needs to be of type string.');
  if (!pathname.startsWith('/')) throw new TypeError('Endpoint pathname needs to start with a /.')
  if (typeof serve !== 'function') throw new TypeError('Endpoint serve needs to be of type function.');

  // create the url pattern based on the given pathname
  const pattern = new URLPattern({ pathname });

  // add the given serve method to the pattern
  pattern.serve = serve;

  // finally add the finalised url pattern as endpoint in the collection of all endpoints
  endpoints.push(pattern);
};


//
// scan()
// Look for endpoint registering modules in the given paths.
// <- dirs: Array<String>
endpoints.scan = (dirs) => {
  // iterate over the given directories in order to look node.js modules to import
  for (const dir of dirs) {
    // get a list of all files and directories within the current directory
    for (const file of fs.readdirSync(dir)) {
      // only process files that do not start with a dot (eg. temporary files) and ensure they end
      // with the extension `.js`, so they are a javascript file
      if (!file.startsWith('.') && file.endsWith('.js')) {
        // load the module at the current destination
        const module = require(`../../${dir}/${file}`);

        // the legacy syntax allows and array of endpoints to be exported so check if this is the
        // case in order to process them further
        if (module instanceof Array) {
          // iterate over all exported endpoints of the module
          for (const endpoint of module) {
            // check the types of the endpoint in order to ensure we only collect valid endpoints
            if (!(endpoint instanceof URLPattern)) throw new TypeError('Endpoint needs to be of type URLPattern.');
            if (typeof endpoint.serve !== 'function') throw new TypeError('Endpoint serve needs to be of type function.');

            // collect the valid endpoint within the collection of all endpoints
            endpoints.push(endpoint);
          }
        }
      }
    }
  }
};


// export the extended array to handle the endpoints
module.exports = endpoints;

// globally make a special endpoints object available, that can be used to add additonal endpoints
globalThis.endpoints = { add: endpoints.add };
