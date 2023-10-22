'use strict';

const { readFileSync } = require('node:fs');
const fs = require('node:fs/promises');

const liveClients = (() => {
  const liveClients = [];

  liveClients.send = (message) => {
    message = `data: ${JSON.stringify(message)}\n\n`;
    console.log(message, 'SSE')

    for(const client of liveClients) {
      client.write(message);
    }
  }
  return liveClients;
})();

module.exports = liveClients;
