'use strict';

/**************************************************************************************************/
/** SETTINGS                                                                                     **/
/** Declare basic settings of the application in this section.                                   **/
/**************************************************************************************************/



/**************************************************************************************************/
/** ELEMENTS                                                                                     **/
/** Get access to all relevant elements of the DOM in this section.                              **/
/**************************************************************************************************/
const $addButton = document.querySelector('.addButton');
const $input = document.querySelector('.entryValue');
const $list = document.querySelector('.list');
const $backArrow = document.querySelector('.arrow');
const $li = document.querySelectorAll('.listItem');
const $form = document.querySelector('form');

let entries = [];
let shoppingLists = [];
let shoppingList = {};
let clickedList = {};
let entry = {};
let joinedGroup = {};
let counter = 0;
/**************************************************************************************************/
/** RUNTIME                                                                                      **/
/** Declare additial variables for the application in this section.                              **/
/**************************************************************************************************/
function renderEntries(){
  const request = new XMLHttpRequest();
  request.open('GET', '/api/v1/groupShoppinglist');
  request.send();
  request.responseType = 'json';

  request.addEventListener('load', function () {
    if(request.readyState === 4 && request.status === 200){

      clickedList = request.response;
      let savedEntries = clickedList.entries;

      if(savedEntries.length === 0){
        renderPlaceholder();
      };

      for(let savedEntry of savedEntries){
        entry = savedEntry;
        entry.save = saveEntry;
        entry.delete = deleteEntry;

      }
      return;
    } else{
      $alertText.textContent = `Fehler beim Laden der Einträge.`;
      customAlert();
    }
  });
}


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

  if(message.type === 'entry' && message.group.id === joinedGroup.id){
    const entry = message.content;
    if(entry.listId === clickedList.id){
      let index = entries.findIndex((newEntry) => newEntry.id === entry.id);
      if(index === -1){
        $alertText.textContent = `${message.info}`;
        customAlert();
        entry.save = saveEntry;
        entry.delete = deleteEntry;
        createNewEntry(entry);
        return;
      } else {
        return;
      }
    } else {
      return;
    }
  }

  if(message.type === 'deleteEntry' && message.group.id === joinedGroup.id){
    if(message.user === joinedGroup.username) {return};
    let entry = message.content;
    if(entry.listId === clickedList.id){
      const $entries = document.querySelectorAll('.listItem');
      $entries.forEach((li) => {
        li.remove();
        counter -= 1;
      });
      loadEntries();
      $alertText.textContent = `${message.info}`;
      customAlert();
      return;
    }
  }

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

async function loadEntries(){
  const response = await fetch('/api/v1/groupShoppinglist');

    if(response.status === 200){
      clickedList =  await response.json();
      let savedEntries = clickedList.entries;

      if(savedEntries.length === 0){
        renderPlaceholder();
      };

      for(let savedEntry of savedEntries){
        entry = savedEntry;
        entry.save = saveEntry;
        entry.delete = deleteEntry;
        createNewEntry(entry);
      }
        return;
    } else{
      $alertText.textContent = `Fehler beim Laden der Einträge.`;
      customAlert();
    }
}

function renderPlaceholder(){
  if(counter === 0){
    const p = document.createElement('p');
    p.className = 'placeholder';
    p.style.color = 'white';
    p.textContent = 'Es wurden noch keine Einträge erstellt.';
    const $main = document.querySelector('main');
    $main.append(p);
  } else {
    const p = document.querySelector('.placeholder');
    if(p){
      p.remove();
      return;
    }
  }
}

function saveEntry(entry) {
  // const entry = this;
  counter = counter;
  if(clickedList.id){
    entry.listId = clickedList.id;
  } else {
    $alertText.textContent = `Fehler beim Speichern des Eintrages.`;
    customAlert();
    return;
  };
  const request = new XMLHttpRequest();

  request.open('POST', `/api/v1/groupShoppingList/${entry.id}`);

  request.send(JSON.stringify(entry));

  request.addEventListener('load', () => {
    if(request.status !== 204){
      $alertText.textContent = `Fehler beim Speichern des Eintrages.`;
      customAlert();
    };
  });
}

function deleteEntry(){
  const entry = this;

  const request = new XMLHttpRequest();

  request.open('DELETE', `/api/v1/groupShoppingList/${entry.id}`);

  request.send();

  request.addEventListener('load', () => {
    if(request.status !== 200){
      $alertText.textContent = `Fehler beim Löschen des Eintrages.`;
      customAlert();
    }
    counter -= 1;
    renderPlaceholder();
  });
}

function addEntry() {

  const $entryValue = $input.value;

  const entry = {
    id: crypto.randomUUID(),
    text: $entryValue,
    listId: '',
    save: saveEntry,
    delete: deleteEntry,
  };

  entries.push(entry);
  entry.save(entry);
  $input.value = '';

  createNewEntry(entry);
};

function createNewEntry(entry){
  const $listItem = document.createElement('li');
  $listItem.className = 'listItem';

  const $textarea = document.createElement('p');
  $textarea.className = 'itemValue';
  $textarea.textContent = entry.text;

  const $deleteButton = document.createElement('button');
  $deleteButton.className = 'deleteButton';
  $deleteButton.textContent = '-';

  $deleteButton.addEventListener('click', function () {
    const index = entries.indexOf(entry);
    entries.splice(index, 1);

    entry.delete();

  $listItem.remove(); //removes the created li element;
  });

  $listItem.append($textarea, $deleteButton);

  $list.append($listItem);
  counter += 1;
  renderPlaceholder();
};

/**************************************************************************************************/
/** EVENTS                                                                                       **/
/** Combine the Elements from above with the declared Functions in this section.                 **/
/**************************************************************************************************/
$addButton.addEventListener('click', addEntry);
$backArrow.addEventListener('click', () => {
  window.location.href = 'groupShopping.html';
});
sse.addEventListener('message', receiveMessage);

$form.addEventListener('submit', (event) => {
  event.preventDefault();
});

$input.focus();
/**************************************************************************************************/
/** SETUP                                                                                        **/
/** If there are any additional steps to take in order to prepare the app, so use this section.  **/
/**************************************************************************************************/
checkGroup();
loadEntries();
