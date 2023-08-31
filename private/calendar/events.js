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
let clickedDay = {};
/**************************************************************************************************/
/** RUNTIME                                                                                      **/
/** Declare additial variables for the application in this section.                              **/
/**************************************************************************************************/



/**************************************************************************************************/
/** FUNCTIONS                                                                                    **/
/** Put the main logic of the application in functions and declare them in this section.         **/
/**************************************************************************************************/
function loadClickedDate() {
  const request = new XMLHttpRequest();
  request.open('GET', '/api/v1/calendarEvents');
  request.send();

  request.addEventListener('load', function () {
    clickedDay = JSON.parse(request.response)
    console.log(clickedDay);
  });
;}

function loadEvents(){

  const request = new XMLHttpRequest();
  request.open('GET', '/api/v1/savedEvents');
  request.send();

  request.addEventListener('load', function () {
    let savedEvents = JSON.parse(request.response);
    for(let i = 0; i < savedEvents.length; i++){
      if(clickedDay.date === savedEvents[i].eventDate){
        calendarEvents.push(savedEvents[i]);
        calendarEvent = savedEvents[i];
        calendarEvent.save = saveEvent;
        calendarEvent.delete = deleteEvent;
        console.log(calendarEvent)
        createNewEvent(calendarEvent);
      };
    };
  });
};

function saveEvent(){
  const request = new XMLHttpRequest();
  request.open('POST', `/api/v1/calendarEvents/${calendarEvent.id}`);
  request.send(JSON.stringify(calendarEvent));

  console.log(request.response)
}

function deleteEvent(calendarEvent){
  const request = new XMLHttpRequest();
  console.log(calendarEvent)
  request.open('DELETE', `/api/v1/calendarEvents/${calendarEvent.id}`);
  request.send();

  request.addEventListener('load', () => {
    console.log(request.status, request.response);
  })
}

function addNewEvent() {

  let eventTitle = $inputTitle.value;
  let eventTime = $inputTime.value;

  calendarEvent = {
    id: clickedDay.id,
    eventTitle: eventTitle,
    eventDate: clickedDay.date,
    eventTime: eventTime,
    save: saveEvent,
    delete: deleteEvent,
  };

  for(let i = 0; i < calendarEvents.length; i++){
    if(calendarEvent.id === calendarEvents[i].id){
      calendarEvent.id = crypto.randomUUID();
    }
  }

  calendarEvents.push(calendarEvent);
  calendarEvent.save();
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
    let index = calendarEvents.indexOf(calendarEvent);
    calendarEvents.splice(index, 1);

    calendarEvent.delete(calendarEvent);

    $eventList.remove();
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
loadClickedDate();
loadEvents();
