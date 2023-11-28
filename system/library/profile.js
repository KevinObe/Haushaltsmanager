'use strict';


// include the required modules
const fs = require('node:fs/promises');


//
// async getProfileForMail()
// Helper method to iterate over all registered users and find the one that uses the given mail
// address.
// <- mail: String
// -> Object
module.exports = async function getProfileForMail(mail) {
  // look for all registered users and iterate over their directories
  for (const user of await fs.readdir('users')) {
    // safely try to open and parse the current user profile
    try {
      // build the path to the profile of the current user and open and render it
      const path = `users/${user}/profile.json`;
      const profile = JSON.parse(await fs.readFile(path, 'utf-8'));

      // return with the profile and the path to it if the mail matches
      if (profile.mail === mail) return { path, profile };
    }

    // if an error occurs, which usually should never happen, skip the current user
    catch {
      continue;
    }
  }

  // reaching this point means that no user has been matches, thus we return still an empty object
  // so it can be destructured and its parts be checked individually
  return {};
};
