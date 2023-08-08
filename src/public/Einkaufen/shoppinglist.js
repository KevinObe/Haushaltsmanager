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
const entries = [];

/**************************************************************************************************/
/** RUNTIME                                                                                      **/
/** Declare additial variables for the application in this section.                              **/
/**************************************************************************************************/



/**************************************************************************************************/
/** FUNCTIONS                                                                                    **/
/** Put the main logic of the application in functions and declare them in this section.         **/
/**************************************************************************************************/
function addEntry() {

  const $entryValue = $input.value;

  const entry = {
    id: crypto.randomUUID(),
    text: $entryValue,
  };

  entries.push(entry);
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

  const $deleteButton = document.createElement('button');
  $deleteButton.className = 'deleteButton';
  $deleteButton.textContent = '-';

  $deleteButton.addEventListener('click', () => {
    const index = entries.indexOf(entry);
    entries.splice(index, 1);

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
