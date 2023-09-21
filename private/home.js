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
    const joinedGroup = await response.json();
    console.log(joinedGroup, response.status)
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
    const joinedGroup = await response.json();
    console.log(joinedGroup, response.status);
    if(response.status === 200){
      window.location.href = 'groupNotes/groupNotes.html';
    };
  } catch (error){
      window.location.href = 'groups/groups.html';
  };
});
/**************************************************************************************************/
/** SETUP                                                                                        **/
/** If there are any additional steps to take in order to prepare the app, so use this section.  **/
/**************************************************************************************************/
