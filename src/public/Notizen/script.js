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
const $notes = document.querySelector('.notes');
const notes = [];

/**************************************************************************************************/
/** RUNTIME                                                                                      **/
/** Declare additial variables for the application in this section.                              **/
/**************************************************************************************************/



/**************************************************************************************************/
/** FUNCTIONS                                                                                    **/
/** Put the main logic of the application in functions and declare them in this section.         **/
/**************************************************************************************************/
function addNote() {

  const $noteValue = $input.value;

  const note = {
    id: crypto.randomUUID(),
    text: $noteValue,
  };

  notes.push(note);
  $input.value = '';
  console.log(note)
  createNewNote(note);
};

function createNewNote(note){
  const $note = document.createElement('li');
  $note.className = 'note';

  const $textarea = document.createElement('textarea');
  $textarea.className = 'noteValue';
  $textarea.value = note.text;

  const $deleteButton = document.createElement('button');
  $deleteButton.className = 'deleteButton';
  $deleteButton.textContent = '-';

  $deleteButton.addEventListener('click', () => {
    const index = notes.indexOf(note);
    notes.splice(index, 1);

  $note.remove(); //removes the created li element;
  });

  $note.append($textarea, $deleteButton);

  $notes.append($note);


};


/**************************************************************************************************/
/** EVENTS                                                                                       **/
/** Combine the Elements from above with the declared Functions in this section.                 **/
/**************************************************************************************************/
$addButton.addEventListener('click', addNote);


/**************************************************************************************************/
/** SETUP                                                                                        **/
/** If there are any additional steps to take in order to prepare the app, so use this section.  **/
/**************************************************************************************************/
