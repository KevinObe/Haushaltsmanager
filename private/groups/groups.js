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
const groupInfo = document.querySelector('#groupInfo');

let joinedGroup;

// Get references to the custom alert elements
const customAlertButton = document.getElementById("customAlertButton");
const customAlert = document.getElementById("customAlert");
const closeBtn = document.querySelector(".close");
const $alertText = document.querySelector('#alertText');
/**************************************************************************************************/
/** RUNTIME                                                                                      **/
/** Declare additial variables for the application in this section.                              **/
/**************************************************************************************************/



/**************************************************************************************************/
/** FUNCTIONS                                                                                    **/
/** Put the main logic of the application in functions and declare them in this section.         **/
/**************************************************************************************************/
async function checkGroup() {
  try{
    const response = await fetch('/api/v1/checkGroup');
    joinedGroup = await response.json();
    console.log(joinedGroup, response.status);
    if(response.status === 200){
      groupInfo.textContent = `Du bist Mitglied der Gruppe ${joinedGroup.groupname}. Du kannst in der Übersicht Inhalte teilen.`
    };
  } catch(error){
    console.log(error);
  };
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
    $alertText.textContent = `Du bist noch kein Mitglied in einer Gruppe!`;
    customAlert.style.display = "block";
  };
};


/**************************************************************************************************/
/** EVENTS                                                                                       **/
/** Combine the Elements from above with the declared Functions in this section.                 **/
/**************************************************************************************************/
$joinBtn.addEventListener('click', function () {
  if(joinedGroup){
    $alertText.textContent = `Du bist bereits Mitglied in der Gruppe ${joinedGroup.groupname}!`;
    customAlert.style.display = "block";
  } else {
    window.location.href = 'join.html';
  };
});

$createBtn.addEventListener('click', function () {
  if(joinedGroup){
    $alertText.textContent = `Du bist bereits Mitglied in der Gruppe ${joinedGroup.groupname}!`;
    customAlert.style.display = "block";
  } else {
    window.location.href = 'create.html';
  };
});

$leaveBtn.addEventListener('click', leaveGroup);

// Close the custom alert when the close button is clicked
closeBtn.addEventListener("click", () => {
  customAlert.style.display = "none";
});
/**************************************************************************************************/
/** SETUP                                                                                        **/
/** If there are any additional steps to take in order to prepare the app, so use this section.  **/
/**************************************************************************************************/
checkGroup();
