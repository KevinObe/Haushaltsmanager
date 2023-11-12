'use strict';

/**************************************************************************************************/
/** SETTINGS                                                                                     **/
/** Declare basic settings of the application in this section.                                   **/
/**************************************************************************************************/



/**************************************************************************************************/
/** ELEMENTS                                                                                     **/
/** Get access to all relevant elements of the DOM in this section.                              **/
/**************************************************************************************************/
const $notes = document.querySelector('.notes');
const $shopping = document.querySelector('.shopping');
const $calendar = document.querySelector('.calendar');
const $settings = document.querySelector('.groupSettings');
const $groupShopping = document.querySelector('.groupShopping');
const $groupNotes = document.querySelector('.groupNotes');
const $shopP = document.querySelector('.groupShopping p');
const $notesP = document.querySelector('.groupNotes p');
const logout = document.querySelector('#logout');

let joinedGroup;
/**************************************************************************************************/
/** RUNTIME                                                                                      **/
/** Declare additial variables for the application in this section.                              **/
/**************************************************************************************************/



/**************************************************************************************************/
/** FUNCTIONS                                                                                    **/
/** Put the main logic of the application in functions and declare them in this section.         **/
/**************************************************************************************************/
function openNotes(){
  window.location.href = '/private/notes/notes.html';
};

function openShopping(){
  window.location.href = '/private/shopping/shopping.html';
};

function openCalendar(){
  window.location.href = '/private/calendar/calendar.html';
};

function openGroupSettings(){
  window.location.href = '/private/groups/groups.html';
};

async function renderGroup() {
  try{
    const response = await fetch('/api/v1/checkGroup');
    if(response.status === 200){
      joinedGroup = await response.json();
    }
  }catch(error){
    console.log(error);
  };
};

function logoutUser() {
  const request = new XMLHttpRequest();
  request.open('GET', '/logout.html');
  request.send();

  request.addEventListener('load', () => {
    window.location.href = '../logout/logout.html';
  })
}

/**************************************************************************************************/
/** EVENTS                                                                                       **/
/** Combine the Elements from above with the declared Functions in this section.                 **/
/**************************************************************************************************/
$notes.addEventListener('click', openNotes);
$settings.addEventListener('click', openGroupSettings);
$calendar.addEventListener('click', openCalendar);
$shopping.addEventListener('click', openShopping);

$groupShopping.addEventListener('click', async () => {
  try{
    const response = await fetch('/api/v1/checkGroup');
    joinedGroup = await response.json();
    if(response.status === 200){
      window.location.href = 'groupShopping/groupShopping.html';
    };
  } catch(error){
      window.location.href = 'groups/groups.html';
  };
});


$groupNotes.addEventListener('click', async () => {
  try{
    const response = await fetch('/api/v1/checkGroup');
    joinedGroup = await response.json();
    if(response.status === 200){
      window.location.href = 'groupNotes/groupNotes.html';
    };
  } catch (error){
      window.location.href = 'groups/groups.html';
  };
});

logout.addEventListener('click', logoutUser);

/**************************************************************************************************/
/** SETUP                                                                                        **/
/** If there are any additional steps to take in order to prepare the app, so use this section.  **/
/**************************************************************************************************/
renderGroup();


// sse events for testing

const sse = new EventSource('/api/v1/live');

function receiveMessage({ data }) {
  // parse the received json message from the server
  const message = JSON.parse(data);

  if(message.type === 'ToDo' && message.group.id === joinedGroup.id){
      $alertText.textContent = `${message.info}`;
      customAlert();
      return;
  }

  if(message.type === 'deleteTodo' && message.group.id === joinedGroup.id){
    $alertText.textContent = `${message.info}`;
    customAlert();
    return;
  }

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

  if(message.type === 'checked' && message.group.id === joinedGroup.id){
    $alertText.textContent = `${message.info}`;
    customAlert();
    return;
  }
}

sse.addEventListener('message', receiveMessage);
