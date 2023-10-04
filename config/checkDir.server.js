'use strict';

const fs = require('node:fs');

let directory = `config/groups`;

try{
  fs.mkdirSync(directory, { recursive: true });
} catch(error) {
  console.log(error);
};
