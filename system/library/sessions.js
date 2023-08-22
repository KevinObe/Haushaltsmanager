'use strict';

// include the required modules
const crypto = require('node:crypto');
const fs = require('node:fs');


//
// options: Object<duration: Number, extendAfter: Number>
// Default session duration and extensions times for the session management. These settings can be
// overwritten in the `config/sessions.json` file.
const options = {
  duration: 60 * 60 * 1_000,
  extendAfter: 60 * 1_000,
  logging: false,
};

//
// sessions: Object
// Collection of all currently active sessions (restored from disk as well as added at runtime).
const sessions = {};

//
// timers: Object
// Collection of all timeout ids to properly handle the expiration of a session on the server.
const timers = {};


// restore the configuration file or create a new one based on the default options set above
{
  // path to the config file
  const file = 'config/sessions.json';

  // try restoring the options from an existing config file
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    options.duration = data.duration;
    options.extendAfter = data.extendAfter;
  }

  // in case of an error write a new config file based on the default options
  catch {
    fs.writeFileSync(file, JSON.stringify(options, null, 2));
  }
}


// ensure the system directory to store the session files does exist
fs.mkdirSync('system/sessions', { recursive: true });


// iterate over the session files directory in order to try to restore existing sessions (this is
// triggered once when the servers (re)starts and requires this module)
for (const rawFile of fs.readdirSync('system/sessions')) {
  // path to the current session file
  const file = `system/sessions/${rawFile}`;

  // apply a filter to ignore files startings with a dot (eg. temporary files) as well as non json
  // files
  if (file.startsWith('.') || !file.endsWith('.json')) continue;

  // try to restore the session from the stored file in the sessions directory
  let session;
  try {
    session = JSON.parse(fs.readFileSync(file, 'utf8'));
  }

  // if reading or parsing of the existing session file failed, then log that issue, delete the file
  // and skip the rest of the tasks
  catch(error) {
    console.log('Fehler beim Wiederherstellen der Session:', error);
    fs.unlinkSync(file);
    continue;
  }

  // at this point we have successfully read the stored session file, so now we need to extend it
  // with the save and destroy methods, as functions are never stored within a json file
  session.save = save;
  session.destroy = destroy;

  // the last remaining issue might be, that the session has already expired, in which case we have
  // to destroy it right away
  const now = Date.now();
  if (session.validUntil < now) {
    session.destroy();
    continue;
  }

  // ensure the restored session has an expiration timer for the rest of its remaining validity
  timers[session.id] = setTimeout(() => session.destroy(), session.validUntil - now);

  // store the fully restored session within the global sessions object
  sessions[session.id] = session;
}


//
// get()
// Extract an existing session from the cookie header of the request or create a new session for the
// user. Either way, properly update the response headers in order to update the session cookies.
// <- request: IncomingMessage
// <- response: ServerResponse
function get(request, response) {
  // extract the cookies from the headers. in case no cookies are set (undefined) we use an empty
  // string as default value.
  const rawCookies = request.headers.cookie || '';

  // multiple cookies, when present, are divided by `; `, so convert that into a search params like
  // string by replacing it with an ampersand and then use the url search params class in oder to
  // automatically get a comfortable usable representation of the cookies
  const cookies = new URLSearchParams(rawCookies.replaceAll('; ', '&'));

  // extract the id (uuid string) from the session (its value is null, if no session cookie is set)
  const id = cookies.get('session');

  // first we check if the id is missing, does not contain exactly 64 signs (= 2 * uuid without `-`)
  // or no session with the given id does exist. in this case we will create a new session for the
  // user.
  if (!id || id.length !== 64 || !sessions[id]) {
    // generate a new and valid session id
    const id = (crypto.randomUUID() + crypto.randomUUID()).replaceAll('-', '');

    // create a new session object with the id and add the save and destroy methods. then we save
    // that object in the collection of all sessions as well as in the new session variable.
    const session = sessions[id] = {
      id,
      save,
      destroy,
    };

    // save the new session right away. by passing the response along the session cookie will also
    // automatically be set.
    session.save(response);

    // return the fully prepared new session
    return session;
  }

  // if we are still here then our task is to restore an existing session based on the given id from
  // the collection of all sessions
  const session = sessions[id];

  // automatically extend the existing session in case its current lifespan has exceeded the extend
  // after time. in the default situation has a session duration of one hour and the session can be
  // extended one minute after the session has been extended previously.
  // we need to pass along the response object here as well, so the updated duration can also be
  // reflected for the cookie expiration date.
  if (session.validUntil < Date.now() + options.duration - options.extendAfter) {
    session.save(response);
  }

  // return the restored session
  return session;
}


//
// save()
// Save the assigned session as well as handle the session validity and optionally the cookie of the
// session.
// <- response?: ServerResponse
function save(response) {
  // this classic method is set within the session object so calling it will contain the session
  // object itself in the dynamic `this` variable and in order to better grasp its meaning we store
  // it in the session variable
  const session = this;

  // if the session has already been destroyed throw an error as this is not allowed
  if (session.validUntil === null) {
    throw new Error('A destroyed session can not be saved again.');
  }

  // handle the expiration timers by stopping the previous one and setting a new one with the amount
  // of milliseconds stored in the options object
  clearTimeout(timers[session.id]);
  timers[session.id] = setTimeout(() => session.destroy(), options.duration);

  // also remember the expiration date of the session within it
  session.validUntil = Date.now() + options.duration;

  // if a response object is given we will update the cookie with the latest expire time as well
  if (response) {
    response.setHeader('Set-Cookie', `session=${session.id}; Max-Age=${options.duration / 1_000}; Path=/`);
  }

  // finally asynchronously save the current state of the session on disk and only react to it when
  // an error occured
  const file = `system/sessions/${session.id}.json`;
  fs.writeFile(file, JSON.stringify(session, null, 2), (error) => {
    if (error) {
      console.log('Fehler beim Speichern der Session:', error);
    }
  });
}


//
// destroy()
// Delete the session from the collection of sessions as well as from the disk and optionally expire
// the session cookie.
// <- response?: ServerResponse
function destroy(response) {
  // this classic method is set within the session object so calling it will contain the session
  // object itself in the dynamic `this` variable and in order to better grasp its meaning we store
  // it in the session variable
  const session = this;

  // mark the existing session object as expired to protect it from missuse like saving it again
  session.validUntil = null;

  // stop the expiration timer and clear the timer id for the session altogether
  clearTimeout(timers[session.id]);
  delete timers[session.id];

  // delete the session from the collection of sessions
  delete sessions[session.id];

  // if a response object is given we will mark the cookie as expired
  if (response) {
    response.setHeader('Set-Cookie', `session=${session.id}; Max-Age=0; Path=/`);
  }

  // log an optionally provided message for the destroy action
  if (session.destroy.message) {
    console.log(session.destroy.message);
  }

  // finally asynchronously delete the session file from the disk and only react to it when an error
  // occured
  const file = `system/sessions/${session.id}.json`;
  fs.unlink(file, (error) => {
    if (error) {
      console.log('Fehler beim Löschen der Session:', error);
    }
  });
}


// export the get method in order to restore and automatically extend existing sessions as well as
// the options, in case a modification at runtime is necessary
module.exports = {
  get,
  options,
};
