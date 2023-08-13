'use strict';


// include the required modules
const fs = require('node:fs');
const http = require('node:http');


//
// rex: Object
// Collection of regular expression patterns to detect unintentional whitespace added by the usage
// of multiline template strings.
const rex = {
  leadingWhitespace: /^\n(\t| )+/s,
  trailingWhitespace: /\n(\t| )+$/s,
  indentationWhitespace: /^(\t| )+/,
};


//
// templates: Object
// Collection of all error templates found in the system and custom template directories.
const templates = {};


// iterate over the system and then custom template directories in order to find provided templates
// and to overwrite any system templates in case custom ones do exist
for (const dir of ['system/templates', 'templates']) {
  // read all files from the template directory
  for (const template of fs.readdirSync(dir)) {
    // only process template files that are either `all.html`, `4xx.html`, `5xx.html` or are using a
    // three digit number like `404.html`
    if (template.match(/^(all|4xx|5xx|\d{3})\.html$/)) {
      // extract the name of the template by removing the extension
      const name = template.split('.')[0];

      // read the template file and save it into the templates object
      templates[name] = fs.readFileSync(`${dir}/${template}`, 'utf8');
    }
  }
}


//
// end()
// Store a reference to the original `response.end` method of the response class, as we will over-
// write the original with a customised one.
const end = http.ServerResponse.prototype.end;


//
// ServerResponse.prototype.end()
// Overwrite the original `response.end` method with a customised one that will use the status code
// and the data to return to the client as indicators of the necessity to insert a custom error page
// template.
// <- ...args: Array
http.ServerResponse.prototype.end = function(...args) {
  // create the response variable to hold a better name for the target of this
  const response = this;

  // extract the status code of the response and get the proper status message from the http module
  const status = response.statusCode;
  const message = http.STATUS_CODES[status];

  // only try to insert a template when the response headers have not been set yet, which indicates
  // that the `response.write` method has never been called and thus it is still save to manipulate
  // headers and if the method has either been called like `response.end('404 Not Found)` or like
  // `response.end()`
  if (
    !response.headersSent &&
    !args[0] || args[0] === `${status} ${message}`
  ) {
    // collect the picked template in here
    let template;

    // determine when to pick a custom error template:
    // a custom error template usually is only used for the status code in the ranges 400 and 500,
    // which indicate either a client error (400 range) or a server error (500 range). those two
    // ranges are the primary targets for a template, as other status codes usually do not make
    // sence to be customised.
    // if a user insists on supplying a custom error template for a status code lower that 400, then
    // it must be explicitly provided, like `204.html`.

    // use a custom template for a specific status code, eg `404.html`
    if (status in templates) {
      template = templates[status];
    }

    // use a fallback template named `4xx.html` for all status codes in the 400 range
    else if (status >= 400 && status < 500 && '4xx' in templates) {
      template = templates['4xx'];
    }

    // use a fallback template named `5xx.html` for all status codes in the 500 range
    else if (status >= 500 && status < 600 && '5xx' in templates) {
      template = templates['5xx'];
    }

    // use a fallback template named `all.html` for all status codes in the 400 and 500 range
    else if (status >= 400 && status < 600) {
      template = templates['all'];
    }

    // only if a template has been picked set the header to tell the client it will receive a html
    // file and overwrite the body to answer with with the picked template and its placeholders
    // replaced with the proper status code (%STATUS%) and status message (%MESSAGE%)
    if (template) {
      response.setHeader('Content-Type', 'text/html; charset=utf-8');
      args[0] = template.replaceAll('%STATUS%', status).replaceAll('%MESSAGE%', message);
    }
  }

  // if we are not applying a template, but the given data parameter (args[0]) is a string, then it
  // might have been created with a template string and thus contain unintentional whitespace, which
  // can brake certain html elements, like indentation in a textarea tag.
  // so here we check if both ends of the data match the typical whitespace present on a typical
  // template string based answer (a line brake immediately followed by spaces or tabs at the start
  // and a line break immediately followed by spaces or tabs at the end)
  else if (
    typeof args[0] === 'string' &&
    args[0].match(rex.leadingWhitespace) && args[0].match(rex.trailingWhitespace)
  ) {
    // save remove the first leading and the last training line break
    if (args[0].at(+0) === '\n') args[0] = args[0].slice(1);
    if (args[0].at(-1) === '\n') args[0] = args[0].slice(0, -1);

    // now determine the amount of spaces or tabs at the begin of the first line and remove that
    // from that first line as well as every following line of the data
    const whitespace = args[0].match(rex.indentationWhitespace);
    if (whitespace) {
      args[0] = args[0]
        .trimStart()
        .replace(new RegExp(`\n${whitespace[1]}`, 'g'), '\n');
    }
  }

  // call the original end method for the current response and pass along the parameter this method
  // has been called with (args[0] is the body to answer with which has properly been injected with
  // a custom error page template above)
  return end.call(response, ...args);
};


// reexport the modified http module
module.exports = http;
