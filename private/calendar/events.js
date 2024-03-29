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
const $backArrow = document.querySelector('.arrow');
const $form = document.querySelector('form');

let calendarEvent = {};
let calendarEvents = [];
let clickedDay = {};
let joinedGroup = {};
/**************************************************************************************************/
/** RUNTIME                                                                                      **/
/** Declare additial variables for the application in this section.                              **/
/**************************************************************************************************/



/**************************************************************************************************/
/** FUNCTIONS                                                                                    **/
/** Put the main logic of the application in functions and declare them in this section.         **/
/**************************************************************************************************/
//check group for server send events
async function checkGroup() {
  try{
    const response = await fetch('/api/v1/checkGroup');
    if(response.status === 200){
      joinedGroup = await response.json();
    };
  }catch(error){
    console.log(error);
  };
};

const sse = new EventSource('/api/v1/live');

function receiveMessage({ data }) {
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
};

function loadClickedDate() {
  const request = new XMLHttpRequest();
  request.open('GET', '/api/v1/calendarEvents');
  request.send();

  request.addEventListener('load', function () {
    if(request.status === 200) {
      clickedDay = JSON.parse(request.response)
      console.log(clickedDay);
    } else {
      $alertText.textContent = `Fehler beim Laden der Events.`;
      customAlert();
    }
  });
;}

function loadEvents(){

  const request = new XMLHttpRequest();
  request.open('GET', '/api/v1/savedEvents');
  request.send();

  request.addEventListener('load', function () {
    if(request.status === 200) {
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
    } else {
      $alertText.textContent = `Fehler beim Speichern des Events.`;
      customAlert();
    }
  });
};

function saveEvent(){
  const request = new XMLHttpRequest();
  request.open('POST', `/api/v1/calendarEvents/${calendarEvent.id}`);
  request.send(JSON.stringify(calendarEvent));

  request.addEventListener('load', () => {
    if(request.status !== 200) {
      $alertText.textContent = `Fehler beim Speichern des Events.`;
      customAlert();
    }
  });
}

function deleteEvent(calendarEvent){
  const request = new XMLHttpRequest();
  console.log(calendarEvent)
  request.open('DELETE', `/api/v1/calendarEvents/${calendarEvent.id}`);
  request.send();

  request.addEventListener('load', () => {
    if(request.status !== 200) {
      $alertText.textContent = `Fehler beim Löschen des Events.`;
      customAlert();
    }
  })
}

function addNewEvent() {

  try{
    if($inputTitle.value.length > 100) throw 'Zu viele Zeichen!';
    if($inputTime.value.length > 5) throw 'Falsche Uhrzeit Werte! Format: HH:MM';
    if($inputTime.value === typeof('string')) throw 'Verwende ausschließlich Zahlen.';

    let eventTitle = $inputTitle.value;
    if(!eventTitle) throw 'Bitte gib einen Eventtitel ein.';
    let time = $inputTime.value.trim();
    let eventTime = '';
    {
      let hours = time.substr(0, 2);
      let minutes = time.substr(3, 2);
      eventTime = `${hours}:${minutes} Uhr`;
      if(eventTime === ': Uhr'){
        throw 'Bitte gib eine gültige Uhrzeit ein.'
      }
    }
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
    createNewEvent(calendarEvent);

  } catch (error) {
    $alertText.textContent = `${error}`;
    customAlert();
    return;
  };
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
  $eventTime.textContent = `${calendarEvent.eventTime}`;
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

sse.addEventListener('message', receiveMessage);

$backArrow.addEventListener('click', () => {
  window.location.href = 'calendar.html';
});

$form.addEventListener('submit', (event) => {
  event.preventDefault();
});

$inputTitle.focus();

/**************************************************************************************************/
/** SETUP                                                                                        **/
/** If there are any additional steps to take in order to prepare the app, so use this section.  **/
/**************************************************************************************************/
loadClickedDate();
loadEvents();
checkGroup();
