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
const $navBtn = document.querySelector('.navBtn');

let entries = [];
let shoppingLists = [];
let shoppingList = {};
let clickedList = {};
let entry = {};
/**************************************************************************************************/
/** RUNTIME                                                                                      **/
/** Declare additial variables for the application in this section.                              **/
/**************************************************************************************************/



/**************************************************************************************************/
/** FUNCTIONS                                                                                    **/
/** Put the main logic of the application in functions and declare them in this section.         **/
/**************************************************************************************************/
/*
function loadLists(){
  const request = new XMLHttpRequest();
  request.open('GET', '/api/v1/shoppingLists');
  request.send();

  request.addEventListener('load', function () {
    if(request.readyState === 4 && request.status === 200){
      shoppingLists = JSON.parse(request.response);
      console.log(shoppingLists);

      loadEntries();
    }
    return;
  })
}
*/
function loadEntries(){
  const request = new XMLHttpRequest();

  request.open('GET', '/api/v1/shoppinglist');
  request.send();
  request.responseType = 'json';

  request.addEventListener('load', function () {
    if(request.readyState === 4 && request.status === 200){
      clickedList = request.response;
      console.log(clickedList)

      let savedEntries = clickedList.entries;
      for(let savedEntry of savedEntries){
        entry = savedEntry;
        entry.save = saveEntry;
        entry.delete = deleteEntry;
        console.log(entry)

        createNewEntry(entry);
      }
        return;
    }
    if(response.status !== 200) {
      alert(`Fehler: ${response.status}`);
    }
  });
}

function saveEntry() {
  const entry = this;

  if(clickedList.id){
    entry.listId = clickedList.id;
  };
  console.log(entry);
  const request = new XMLHttpRequest();

  request.open('POST', `/api/v1/shoppingList/${entry.id}`)

  request.send(JSON.stringify(entry));

  request.addEventListener('load', () => {
    if(request.status !== 204){
      alert(`Fehler: ${request.status}`);
    }
  });
}

function deleteEntry(){
  const entry = this;

  const request = new XMLHttpRequest();

  request.open('DELETE', `/api/v1/shoppingList/${entry.id}`);

  request.send();

  request.addEventListener('load', () => {
    if(request.status !== 200){
      alert(`Fehler: ${request.status}`);
    }
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
  entry.save();
  $input.value = '';
  console.log(entry)
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
};


/**************************************************************************************************/
/** EVENTS                                                                                       **/
/** Combine the Elements from above with the declared Functions in this section.                 **/
/**************************************************************************************************/
$addButton.addEventListener('click', addEntry);
$navBtn.addEventListener('click', () => window.location.href = 'shopping.html');

/**************************************************************************************************/
/** SETUP                                                                                        **/
/** If there are any additional steps to take in order to prepare the app, so use this section.  **/
/**************************************************************************************************/
loadEntries();
