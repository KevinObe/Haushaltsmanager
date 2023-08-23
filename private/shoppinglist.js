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
let entries = [];

/**************************************************************************************************/
/** RUNTIME                                                                                      **/
/** Declare additial variables for the application in this section.                              **/
/**************************************************************************************************/



/**************************************************************************************************/
/** FUNCTIONS                                                                                    **/
/** Put the main logic of the application in functions and declare them in this section.         **/
/**************************************************************************************************/
function loadEntries(){
  const request = new XMLHttpRequest();

  request.open('GET', '/api/v1/shoppinglist');

  request.send();

  request.responseType = 'json';

  request.addEventListener('load', () => {
    if(request.status === 200){
      entries = request.response;

      for(const entry of entries) {
        entry.save = saveEntry;
        entry.delete = deleteEntry;

        createNewEntry(entry);
      }
      return;
    }

    alert(`Fehler: ${response.status}`);
  });
}

function saveEntry() {
  const entry = this;

  const request = new XMLHttpRequest();

  request.open('POST', `/api/v1/shoppinglist/${entry.id}`)

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

  request.open('DELETE', `/api/v1/shoppinglist/${entry.id}`);

  request.send();

  request.addEventListener('load', () => {
    if(request.status !== 204){
      alert(`Fehler: ${request.status}`);
    }
  });
}

function addEntry() {

  const $entryValue = $input.value;

  const entry = {
    id: crypto.randomUUID(),
    text: $entryValue,
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

  const $textarea = document.createElement('textarea');
  $textarea.className = 'itemValue';
  $textarea.value = entry.text;

  $textarea.addEventListener('input', function(){
    entry.text = $textarea.value;
    entry.save();
  });

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


/**************************************************************************************************/
/** SETUP                                                                                        **/
/** If there are any additional steps to take in order to prepare the app, so use this section.  **/
/**************************************************************************************************/
loadEntries();
