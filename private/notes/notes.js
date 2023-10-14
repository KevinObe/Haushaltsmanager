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
let notes = [];

/**************************************************************************************************/
/** RUNTIME                                                                                      **/
/** Declare additial variables for the application in this section.                              **/
/**************************************************************************************************/



/**************************************************************************************************/
/** FUNCTIONS                                                                                    **/
/** Put the main logic of the application in functions and declare them in this section.         **/
/**************************************************************************************************/

function loadNotes(){
  const request = new XMLHttpRequest();

  request.open('GET', '/api/v1/notes');

  request.send();

  request.responseType = 'json';

  request.addEventListener('load', () => {
    if(request.status === 200){
      notes = request.response;

      for(const note of notes) {
        note.save = saveNote;
        note.delete = deleteNote;

        createNewNote(note);
      }
      return;
    }

    alert(`Fehler: ${response.status}`);
  });
}


function saveNote(note) {
 // const note = this;

  const request = new XMLHttpRequest();

  request.open('POST', `/api/v1/notes/${note.id}`)

  request.send(JSON.stringify(note));

  request.addEventListener('load', () => {
    if(request.status !== 200){
      alert(`Fehler: ${request.status}`);
    }
  });
}

function deleteNote(){
  const note = this;

  const request = new XMLHttpRequest();

  request.open('DELETE', `/api/v1/notes/${note.id}`);

  request.send();

  request.addEventListener('load', () => {
    if(request.status !== 200){
      alert(`Fehler: ${request.status}`);
    }
  });
}



// older stuff ....
function addNote() {

  const $noteValue = $input.value;

  const note = {
    id: crypto.randomUUID(),
    text: $noteValue,
    done: false,
    save: saveNote,
    delete: deleteNote,
  };

  notes.push(note);
  note.save(note);
  $input.value = '';
  console.log(note)
  createNewNote(note);
};

function createNewNote(note){
  const $note = document.createElement('li');
  $note.className = 'note';

  const $checkbox = document.createElement('input');
  $checkbox.className = 'checkbox';
  $checkbox.type = 'checkbox';
  $checkbox.checked = note.done;

  $checkbox.addEventListener('input', function () {
    note.done = $checkbox.checked;
    saveNote(note);
  });

  const $textarea = document.createElement('p');
  $textarea.className = 'noteValue';
  $textarea.textContent = note.text;

  $textarea.addEventListener('input', function(){
    note.text = $textarea.value;
    note.save(note);
  });

  const $deleteButton = document.createElement('button');
  $deleteButton.className = 'deleteButton';
  $deleteButton.textContent = '-';

  $deleteButton.addEventListener('click', function () {
    const index = notes.indexOf(note);
    notes.splice(index, 1);

  note.delete();

  $note.remove(); //removes the created li element;
  });

  $note.append($checkbox, $textarea, $deleteButton);

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
loadNotes();
