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
const $backArrow = document.querySelector('.arrow');

let joinedGroup;
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
    if(response.status === 200){
      groupInfo.textContent = `Du bist Mitglied der Gruppe ${joinedGroup.groupname.substring(0,20)}. Du kannst in der Übersicht Inhalte teilen.`
      $leaveBtn.disabled = false;
    };
  } catch(error){
    console.log(error);
  };
};

const sse = new EventSource('/api/v1/live');

function receiveMessage({ data }) {
  // parse the received json message from the server
  const message = JSON.parse(data);

  //info messages todo
  if(message.type === 'ToDo' && message.group.id === joinedGroup.id){
    $alertText.textContent = `${message.info}`;
    customAlert();
    return;
  }

  if(message.type === 'checked' && message.group.id === joinedGroup.id){
    $alertText.textContent = `${message.info}`;
    customAlert();
    return;
  }

  if(message.type === 'deleteTodo' && message.group.id === joinedGroup.id){
    $alertText.textContent = `${message.info}`;
    customAlert();
    return;
  }

  //info messages shopping
  if(message.type === 'shoppingList' && message.group.id === joinedGroup.id){
    $alertText.textContent = `${message.info}`;
    customAlert();
    return;
  }

  if(message.type === 'deleteList' && message.group.id === joinedGroup.id){
    $alertText.textContent = `${message.info}`;
    customAlert();
    return;
  }
}

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
    customAlert();
  };
};

/**************************************************************************************************/
/** EVENTS                                                                                       **/
/** Combine the Elements from above with the declared Functions in this section.                 **/
/**************************************************************************************************/
$joinBtn.addEventListener('click', function () {
  if(joinedGroup){
    $alertText.textContent = `Du bist bereits Mitglied in der Gruppe ${joinedGroup.groupname.substring(0,20)}!`;
    customAlert();
  } else {
    window.location.href = 'join.html';
  };
});

$createBtn.addEventListener('click', function () {
  if(joinedGroup){
    $alertText.textContent = `Du bist bereits Mitglied in der Gruppe ${joinedGroup.groupname.substring(0,20)}!`;
    customAlert();
  } else {
    window.location.href = 'create.html';
  };
});

$leaveBtn.addEventListener('click', leaveGroup);
sse.addEventListener('message', receiveMessage);

$backArrow.addEventListener('click', () => {
  window.location.href = '../index.html';
})
/**************************************************************************************************/
/** SETUP                                                                                        **/
/** If there are any additional steps to take in order to prepare the app, so use this section.  **/
/**************************************************************************************************/
checkGroup();
