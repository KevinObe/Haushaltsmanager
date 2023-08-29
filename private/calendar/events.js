'use strict';

/**************************************************************************************************/
/** SETTINGS                                                                                     **/
/** Declare basic settings of the application in this section.                                   **/
/**************************************************************************************************/



/**************************************************************************************************/
/** ELEMENTS                                                                                     **/
/** Get access to all relevant elements of the DOM in this section.                              **/
/**************************************************************************************************/
const $inputTitle = document.querySelector('.inputTitle');
const $inputTime = document.querySelector('.inputTime');
const $addButton = document.querySelector('.addButton');

let calendarEvent = {};
let calendarEvents = [];
/**************************************************************************************************/
/** RUNTIME                                                                                      **/
/** Declare additial variables for the application in this section.                              **/
/**************************************************************************************************/



/**************************************************************************************************/
/** FUNCTIONS                                                                                    **/
/** Put the main logic of the application in functions and declare them in this section.         **/
/**************************************************************************************************/
function addNewEvent() {

  let eventTitle = $inputTitle.value;
  let eventTime = $inputTime.value;

  calendarEvent = {
    eventTitle: eventTitle,
    eventDate: '',
    eventTime: eventTime,

  };

  calendarEvents.push(calendarEvent);
  $inputTitle.value = '';
  $inputTime.value = '';
  console.log(calendarEvents)
  console.log(calendarEvent)
  createNewEvent(calendarEvent);
};

function createNewEvent(calendarEvent) {
  const $eventList = document.createElement('div');
  $eventList.className = 'eventList';

  const $eventTitle = document.createElement('h2');
  $eventTitle.textContent = calendarEvent.eventTitle;
  $eventTitle.className = 'eventTitle';

  const $eventDate = document.createElement('div');
  $eventDate.textContent = calendarEvent.eventDate;
  $eventDate.className = 'eventDate';

  const $eventTime = document.createElement('div');
  $eventTime.textContent = `${calendarEvent.eventTime} Uhr`;
  $eventTime.className = 'eventTime';

  const $deleteButton = document.createElement('button');
  $deleteButton.textContent = 'Löschen';
  $deleteButton.className = 'deleteButton';

  document.querySelector('main').append($eventList);
  $eventList.append($eventTitle, $eventDate, $eventTime, $deleteButton);

  $deleteButton.addEventListener('click', function () {
    console.log('Löschen');
  });


};

/**************************************************************************************************/
/** EVENTS                                                                                       **/
/** Combine the Elements from above with the declared Functions in this section.                 **/
/**************************************************************************************************/
$addButton.addEventListener('click', addNewEvent);


/**************************************************************************************************/
/** SETUP                                                                                        **/
/** If there are any additional steps to take in order to prepare the app, so use this section.  **/
/**************************************************************************************************/
