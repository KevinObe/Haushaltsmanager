'use strict';


// include the required modules
const crypto = require('node:crypto');
const fs = require('node:fs');


// check if the program has been called without any parameters, like `node create-user.js` or with a
// help parameter like `node create-user.js --help` in order to show the user a quick description of
// how to use this tool
if (
  process.argv.slice(2).length === 0 ||
  ['-h', '--help'].includes(process.argv[2])
) {
  console.log('node create-user.js <username> <password> <firstname> <lastname>');
  process.exit();
}


// extract all the parameters from the call of the application and lowercase the username, so it is
// case insensitive und handled in a unified way
const username = process.argv[2].toLocaleLowerCase();
const password = process.argv[3];
const fname = process.argv[4];
const lname = process.argv[5];

// exit the application with error code 1 if one of the parameters is empty
if (!username || !password || !fname || !lname) {
  console.log('error: missing parameter');
  console.log('node create-user.js <username> <password> <firstname> <lastname>');
  process.exit(1);
}


// build the profile object for the new user to create
const profile = {
  id: crypto.randomUUID(),
  username,
  password,
  groups: [],
  name: {
    firstname: fname,
    lastname: lname,
  },
};

// above we used the password as is it reserve it at spot after the username in the resulting config
// file, but now we ensure that the password is not stored as cleartext but as a hash with enough
// salt to make it unique
profile.password = crypto.createHash('sha256')
  .update(`${profile.id}:${profile.username}:${profile.password}`)
  .digest('hex');


// prepare the path of the user directory and the json file to store the profile in
const dir = `../../users/${username}`;
const path = `${dir}/profile.json`;

// create the user directory and user profile file. if the user already exists this will throw an
// error, which indicates the failure
fs.mkdirSync(dir);
fs.writeFileSync(path, JSON.stringify(profile, null, 2));
