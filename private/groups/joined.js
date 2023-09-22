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
    const joinedGroup = await response.json();
    if(response.status === 200){
      $groupInfo.textContent = `Du bist nun Mitglied der Gruppe ${joinedGroup.groupname}!`
    }
  }catch(error){
    console.log(error);
  };
};


/**************************************************************************************************/
/** EVENTS                                                                                       **/
/** Combine the Elements from above with the declared Functions in this section.                 **/
/**************************************************************************************************/
$homeBtn.addEventListener('click', () => {
  window.location.href = '../home.html';
});


/**************************************************************************************************/
/** SETUP                                                                                        **/
/** If there are any additional steps to take in order to prepare the app, so use this section.  **/
/**************************************************************************************************/
renderGroup();
