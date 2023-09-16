'use strict';

/**************************************************************************************************/
/** SETTINGS                                                                                     **/
/** Declare basic settings of the application in this section.                                   **/
/**************************************************************************************************/



/**************************************************************************************************/
/** ELEMENTS                                                                                     **/
/** Get access to all relevant elements of the DOM in this section.                              **/
/**************************************************************************************************/
const $joinBtn = document.querySelector('#loginBtn');
const $createBtn = document.querySelector('#registerBtn');

let joinedGroup = {};
/**************************************************************************************************/
/** RUNTIME                                                                                      **/
/** Declare additial variables for the application in this section.                              **/
/**************************************************************************************************/



/**************************************************************************************************/
/** FUNCTIONS                                                                                    **/
/** Put the main logic of the application in functions and declare them in this section.         **/
/**************************************************************************************************/
function checkGroup() {
  const request = new XMLHttpRequest();
  request.open('GET', '/api/v1/checkGroup');
  request.send();

  request.addEventListener('load', () => {
    joinedGroup = JSON.parse(request.response);
    console.log(joinedGroup);
  });
};


/**************************************************************************************************/
/** EVENTS                                                                                       **/
/** Combine the Elements from above with the declared Functions in this section.                 **/
/**************************************************************************************************/
$joinBtn.addEventListener('click', function () {
  window.location.href = 'join.html';
});

$createBtn.addEventListener('click', function () {
  window.location.href = 'create.html';
});


/**************************************************************************************************/
/** SETUP                                                                                        **/
/** If there are any additional steps to take in order to prepare the app, so use this section.  **/
/**************************************************************************************************/
checkGroup();
