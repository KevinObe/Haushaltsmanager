'use strict';


// this file includes a function capable of sending estmp based html mails to a mail hosting service
// provider using an tls enabled tcp connection (neither cleartext nor starttls) to the configured
// mail exchange server.


// include the required modules
const { connect } = require('node:tls');
const { readFileSync } = require('node:fs');


/*
// Example of config/mail.json
// If the debug key is enabled, then the send function will log the communication with the smtp host
// server to the console.
{
  "debug": true,
  "server": {
    "host": "mail.gmx.net",
    "port": 465
  },
  "name": "Your Name",
  "mail": "your-gmx-mail-address@gmx.net",
  "password": "your-gmx-password"
}
*/


//
// config: Object
// Try to read the configuration file from the config folder or use null as the default value, which
// inidicates that the mail sending feature is not available.
const config = (() => {
  try {
    return JSON.parse(readFileSync('config/mail.json', 'utf8'));
  } catch {
    return null;
  }
})();


//
// base64()
// Helper method to properly encode strings into correct base64 strings, because the native `btoa`
// method does not encode the base64 format correctly.
// <- msg: String
// -> String
function base64(msg) {
  return btoa(encodeURIComponent(msg).replace(/%([0-9A-F]{2})/g, (_, char) => {
    return String.fromCharCode(`0x${char}`);
  }));
}


//
// quoted()
// Helper method to encode all special characters of a mail into a quoted notation, so every mail
// can properly deal with umlauts, special characters and other utf-8 stuff, that the smtp protocol
// itself can not properly handle, eg. `Müller` -> `M=C3=BCller`.
// <- msg: String
// -> String
function quoted(msg) {
  return encodeURIComponent(msg).replace(/%(?=[0-9A-F]{2})/g, '=');
}


//
// async send()
// Function to use the esmtp protocol to connect to the configured server using the provided login
// credentials to send a html mail to the given user with the given subject and body.
// <- to: String
// <- subject: String
// <- body: String
// -> Boolean<true> | throw Error
module.exports.send = async function send(to, subject, body) {
  // ensure the server configuration is properly set up or throw an error right away, if the user
  // tries to invoke this function
  if (
    typeof config?.server?.host !== 'string' ||
    typeof config?.server?.port !== 'number' ||
    config?.server?.port < 1 ||
    config?.server?.port > 65535 ||
    typeof config?.name !== 'string' ||
    typeof config?.mail !== 'string' ||
    typeof config?.password !== 'string'
  ) throw new Error('Config file /config/mail.json is not correctly formatted');

  // connect to the mail exchange server using a tls encrypted tcp connection
  const socket = connect(config.server);

  // register to the connect and close methods methods if debugging is enabled in order to activate
  // logging of those events
  if (config.debug) {
    socket.once('connect', () => console.log('Connected'));
    socket.once('close', () => console.log('Disconnected'));
  }

  //
  // read()
  // Define a helper method to quickly collect a single message from the server.
  // <- Object<expect: Number, error: String>
  // -> Promise<undefined>
  const read = ({ expect, error }) => new Promise((resolve) => {
    // wait for a single data answer of the server
    socket.once('data', (raw) => {
      // parse the received buffer based message and convert it to a string and trim the trailing
      // \r\n suffic
      const data = raw.toString().trimEnd();

      // extract the status code from the answer, which is the very first three digits of the data
      const code = parseInt(data.slice(0, 3));

      // log the received data if debug logging is enabled
      if (config.debug) {
        console.log('<<<', data);
      }

      // ensure the received status code equals the expected status code, which is applied to only
      // continue to follow the esmtp protocol, if the previous command is processed as expected
      if (code !== expect) {
        throw new Error(`${error}: ${data}`);
      }

      // resolve the promise, if the received message if the expection has been met
      resolve();
    });
  });

  //
  // send()
  // Helper method to easily send and properly formatted command to the mail exchange server.
  // <- data: Array<String>
  const send = (...data) => {
    // iterate over all given parameters
    data.forEach((data) => {
      // log the data to send if debug logging is enabled
      if (config.debug) {
        console.log('>>>', data);
      }

      // send the current piece of data to the mail exchange server by append the proper line break
      // sequence used by the smtp protocol
      socket.write(`${data}\r\n`);
    });
  };

  // start communication with the mail exchange server using the esmtp protocol with authentication
  // for a html based mail
  await read({ expect: 220, error: `Unexpected opening message` });
  send('EHLO smtp.js');
  await read({ expect: 250, error: `Unexpected hello answer` });
  send('AUTH LOGIN');
  await read({ expect: 334, error: `Unexpected auth answer` });
  send(base64(config.mail));
  await read({ expect: 334, error: `Unexpected auth username answer` });
  send(base64(config.password));
  await read({ expect: 235, error: `Unexpected auth password answer` });
  send(`MAIL FROM: <${config.mail}>`);
  await read({ expect: 250, error: `Unexpected sender answer` });
  send(`RCPT TO: <${to}>`);
  await read({ expect: 250, error: `Unexpected recepient answer` });
  send('DATA');
  await read({ expect: 354, error: `Unexpected data answer` });
  send(
    `From: "${config.name}" <${config.mail}>`,
    `To: <${to}>`,
    'Content-Transfer-Encoding: quoted-printable',
    `Content-Type: text/html; charset=utf-8`,
    `Subject: =?UTF-8?B?${base64(subject)}?=`,
    ``,
    quoted(body.replaceAll('\r\n', '\n').replaceAll('\n', '\r\n')),
    `.`,
  );
  await read({ expect: 250, error: `Unexpected message answer` });
  send('QUIT');

  // if we reached this point, then the esmtp protocol has been properly executed and the mail is
  // going to be sent, so we can return the success with a true boolean
  return true;
}
