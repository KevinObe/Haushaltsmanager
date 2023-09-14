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
  const request = new XMLHttpRequest();
  request.open('GET', '/private/notes/notes.html');
  request.send();

  request.addEventListener('load', () => {
    window.location.href = '/private/notes/notes.html';
  })
}

function openShopping(){
  const request = new XMLHttpRequest();
  request.open('GET', '/private/shopping/shopping.html');
  request.send();

  request.addEventListener('load', () => {
    window.location.href = '/private/shopping/shopping.html';
  })
}

function openCalendar(){
  const request = new XMLHttpRequest();
  request.open('GET', '/private/calendar/calendar.html');
  request.send();

  request.addEventListener('load', () => {
    window.location.href = '/private/calendar/calendar.html';
  })
}

function openGroupSettings(){
  const request = new XMLHttpRequest();
  request.open('GET', '/private/groups/groups.html');
  request.send();

  request.addEventListener('load', () => {
    window.location.href = '/private/groups/groups.html';
  })
}

function openGroupShopping() {
  window.location.href = '/private/groupShopping/groupShopping.html';
}

function openGroupNotes() {

}


/**************************************************************************************************/
/** EVENTS                                                                                       **/
/** Combine the Elements from above with the declared Functions in this section.                 **/
/**************************************************************************************************/
$notes.addEventListener('click', openNotes);
$shopping.addEventListener('click', openShopping);
$calendar.addEventListener('click', openCalendar);
$settings.addEventListener('click', openGroupSettings);
$groupShopping.addEventListener('click', openGroupShopping);
$groupNotes.addEventListener('click', openGroupNotes);
/**************************************************************************************************/
/** SETUP                                                                                        **/
/** If there are any additional steps to take in order to prepare the app, so use this section.  **/
/**************************************************************************************************/
