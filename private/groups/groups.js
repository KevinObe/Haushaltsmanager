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
const $leaveBtn = document.querySelector('#leaveBtn');

let joinedGroup;
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

function leaveGroup() {
  if(joinedGroup !== undefined){
    const request = new XMLHttpRequest();
    request.open('DELETE', '/api/v1/leaveGroup');
    request.send(JSON.stringify(joinedGroup));

    request.addEventListener('load', () => {
      window.location.href = '/private/groups/groups.html';
    });
  } else {
    alert('Noch keiner Gruppe beigetreten.');
  };
};


/**************************************************************************************************/
/** EVENTS                                                                                       **/
/** Combine the Elements from above with the declared Functions in this section.                 **/
/**************************************************************************************************/
$joinBtn.addEventListener('click', function () {
  if(joinedGroup){
    alert(`Bereits Mitglied in der Gruppe ${joinedGroup.groupname}`)
  } else {
    window.location.href = 'join.html';
  };
});

$createBtn.addEventListener('click', function () {
  if(joinedGroup){
    alert(`Bereits Mitglied in der Gruppe ${joinedGroup.groupname}`)
  } else {
    window.location.href = 'create.html';
  };
});

$leaveBtn.addEventListener('click', leaveGroup);

/**************************************************************************************************/
/** SETUP                                                                                        **/
/** If there are any additional steps to take in order to prepare the app, so use this section.  **/
/**************************************************************************************************/
checkGroup();
