'use strict';

/**************************************************************************************************/
/** SETTINGS                                                                                     **/
/** Declare basic settings of the application in this section.                                   **/
/**************************************************************************************************/



/**************************************************************************************************/
/** ELEMENTS                                                                                     **/
/** Get access to all relevant elements of the DOM in this section.                              **/
/**************************************************************************************************/
const $homeBtn = document.querySelector('#homeBtn');
const $groupInfo = document.querySelector('#groupInfo');
const $backArrow = document.querySelector('.arrow');

let joinedGroup = {};
/**************************************************************************************************/
/** RUNTIME                                                                                      **/
/** Declare additial variables for the application in this section.                              **/
/**************************************************************************************************/



/**************************************************************************************************/
/** FUNCTIONS                                                                                    **/
/** Put the main logic of the application in functions and declare them in this section.         **/
/**************************************************************************************************/
async function renderGroup() {
  try{
    const response = await fetch('/api/v1/checkGroup');
    if(response.status === 200){
      joinedGroup = await response.json();
      $groupInfo.textContent = `Du bist nun Mitglied der Gruppe ${joinedGroup.groupname.substring(0,20)}!`
    }
  }catch(error){
    console.log(error);
  };
};

const sse = new EventSource('/api/v1/live');

function receiveMessage({ data }) {
  // parse the received json message from the server
  const message = JSON.parse(data);

  if(message.type === 'online' && message.group.id === joinedGroup.id){
    const online = message.info;
    $alertText.textContent = `${online}`;
    customAlert();
    return;
  }

  if(message.type === 'online' && message.group.id === false){
    const online = message.info;
    $alertText.textContent = `${online}`;
    customAlert();
    return;
  }

    //info messages todo
  if(message.type === 'ToDo' && message.group.id === joinedGroup.id){
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
}


/**************************************************************************************************/
/** EVENTS                                                                                       **/
/** Combine the Elements from above with the declared Functions in this section.                 **/
/**************************************************************************************************/
$homeBtn.addEventListener('click', () => {
  window.location.href = '../index.html';
});

sse.addEventListener('message', receiveMessage);

$backArrow.addEventListener('click', () => {
  window.location.href = 'groups.html';
})

/**************************************************************************************************/
/** SETUP                                                                                        **/
/** If there are any additional steps to take in order to prepare the app, so use this section.  **/
/**************************************************************************************************/
renderGroup();
