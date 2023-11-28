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
const $backArrow = document.querySelector('.arrow');
const $form = document.querySelector('form');

const $entries = [];

let shoppingLists = [];
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

function loadLists(){
  const request = new XMLHttpRequest();

  request.open('GET', '/api/v1/shoppingLists');

  request.send();

  request.responseType = 'json';

  request.addEventListener('load', () => {
    if(request.status === 200){
      shoppingLists = request.response;

      if(shoppingLists.length === 0){
        renderPlaceholder();
      }

      for(const shoppingList of shoppingLists){
        shoppingList.save = saveList;
        shoppingList.delete = deleteList;

        createNewList(shoppingList);
      }
      return;
    }
    $alertText.textContent = `Fehler beim laden der Listen.`;
    customAlert();
  });
}

function renderPlaceholder(){
  const p = document.createElement('p');
  if(shoppingLists.length === 0){
    p.className = 'placeholder';
    p.style.color = 'white';
    p.textContent = 'Es wurden noch keine Einkaufslisten erstellt.';
    const $main = document.querySelector('main');
    $main.append(p);
  } else {
    const p = document.querySelector('.placeholder');
    p.remove();
  }
}

function saveList(){
  const shoppingList = this;

  const request = new XMLHttpRequest();

  request.open('POST', `/api/v1/shoppingLists/${shoppingList.id}`)

  request.send(JSON.stringify(shoppingList));

  request.addEventListener('load', () => {
    if(request.status !== 200){
      $alertText.textContent = `Fehler beim speichern der Liste.`;
      customAlert();
    }
  });
}

function deleteList(){
  const shoppingList = this;

  const request = new XMLHttpRequest();

  request.open('DELETE', `/api/v1/shoppingLists/${shoppingList.id}`);

  request.send();

  request.addEventListener('load', () => {
    if(request.status !== 200){
      $alertText.textContent = `Fehler beim löschen der Liste.`;
      customAlert();
    }
    renderPlaceholder();
  });
}

//older code without server
function addNewList() {

  let listName = $listName.value;

  const shoppingList = {
    id: crypto.randomUUID(),
    title: listName,
    entries: $entries,
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

  $openListButton.addEventListener('click', function () {
    openList(shoppingList);
  });

  $deleteButton.addEventListener('click', () => {
    const index = shoppingLists.indexOf(shoppingList);
    shoppingLists.splice(index, 1);

    shoppingList.delete();

    $shoppingList.remove();
  });
  renderPlaceholder();
};

function openList(shoppingList){

  const request = new XMLHttpRequest();

  request.open('GET', `/api/v1/shoppinglist/${shoppingList.id}`);

  request.send();

  request.responseType = 'json';

  request.addEventListener('load', () => {
    if(request.readyState === 4 && request.status === 200){
      shoppingList = request.response;
      window.location.href = '/private/shopping/shoppinglist.html';
    }
  })
};


/**************************************************************************************************/
/** EVENTS                                                                                       **/
/** Combine the Elements from above with the declared Functions in this section.                 **/
/**************************************************************************************************/
$addButton.addEventListener('click', addNewList);
sse.addEventListener('message', receiveMessage);
$backArrow.addEventListener('click', () => {
  window.location.href = '../index.html';
})

$listName.focus();

$form.addEventListener('submit', (event) => {
  event.preventDefault();
});
/**************************************************************************************************/
/** SETUP                                                                                        **/
/** If there are any additional steps to take in order to prepare the app, so use this section.  **/
/**************************************************************************************************/
loadLists();
checkGroup();
