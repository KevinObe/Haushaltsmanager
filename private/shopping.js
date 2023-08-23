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
const $listName = document.querySelector('.listname');
const $entries = [];
let shoppingLists = [];

/**************************************************************************************************/
/** RUNTIME                                                                                      **/
/** Declare additial variables for the application in this section.                              **/
/**************************************************************************************************/



/**************************************************************************************************/
/** FUNCTIONS                                                                                    **/
/** Put the main logic of the application in functions and declare them in this section.         **/
/**************************************************************************************************/
function loadLists(){
  const request = new XMLHttpRequest();

  request.open('GET', '/api/v1/shoppingLists');

  request.send();

  request.responseType = 'json';

  request.addEventListener('load', () => {
    if(request.status === 200){
      shoppingLists = request.response;

      for(const shoppingList of shoppingLists){
        shoppingList.save = saveList;
        shoppingList.delete = deleteList;

        createNewList(shoppingList);
      }
      return;
    }

    alert(`Fehler: ${response.status}`);
  });
}

function saveList(){
  const shoppingList = this;

  const request = new XMLHttpRequest();

  request.open('POST', `/api/v1/shoppingLists/${shoppingList.id}`)

  request.send(JSON.stringify(shoppingList));

  request.addEventListener('load', () => {
    if(request.status !== 204){
      alert(`Fehler: ${response.status}`);
    }
  });
}

function deleteList(){
  const shoppingList = this;

  const request = new XMLHttpRequest();

  request.open('DELETE', `/api/v1/shoppingLists/${shoppingList.id}`);

  request.send();

  request.addEventListener('load', () => {
    if(request.status !== 204){
      alert(`Fehler: ${request.status}`);
    }
  });
}

//older code without server
function addNewList() {

  let listName = $listName.value;

  const shoppingList = {
    id: crypto.randomUUID(),
    title: listName,
    text: $entries,
    save: saveList,
    delete: deleteList,
  };

  shoppingLists.push(shoppingList)
  shoppingList.save();
  $listName.value = '';
  console.log(shoppingLists)
  console.log(shoppingList)
  createNewList(shoppingList);
};

function createNewList(shoppingList){

  const $shoppingList = document.createElement('div');
  $shoppingList.className = 'shoppingList';

  const $listTitle = document.createElement('h2');
  $listTitle.textContent = shoppingList.title;
  $listTitle.className = 'listTitle';

  const $openListButton = document.createElement('button');
  $openListButton.textContent = 'Anzeigen';
  $openListButton.className = 'openListButton';

  const $deleteButton = document.createElement('button');
  $deleteButton.textContent = 'Löschen';
  $deleteButton.className = 'deleteButton';

  document.querySelector('main').append($shoppingList);
  $shoppingList.append($listTitle, $openListButton, $deleteButton);

  $openListButton.addEventListener('click', openList);

  $deleteButton.addEventListener('click', () => {
    const index = shoppingLists.indexOf(shoppingList);
    shoppingLists.splice(index, 1);

    shoppingList.delete();

    $shoppingList.remove();
  });

};

function openList(){
  console.log('Liste wird geöffnet.')

  const request = new XMLHttpRequest();

  request.open('GET', `/api/v1/shoppingLists`);

  request.send();

  request.responseType = 'json';

  request.addEventListener('load', () => {
    if(request.readyState === 4 && request.status === 200){
      window.location.href = 'shoppinglist.html';
    }
  })
};


/**************************************************************************************************/
/** EVENTS                                                                                       **/
/** Combine the Elements from above with the declared Functions in this section.                 **/
/**************************************************************************************************/
$addButton.addEventListener('click', addNewList);


/**************************************************************************************************/
/** SETUP                                                                                        **/
/** If there are any additional steps to take in order to prepare the app, so use this section.  **/
/**************************************************************************************************/
loadLists();
