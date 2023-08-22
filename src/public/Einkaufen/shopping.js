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
const shoppingLists = [];

/**************************************************************************************************/
/** RUNTIME                                                                                      **/
/** Declare additial variables for the application in this section.                              **/
/**************************************************************************************************/



/**************************************************************************************************/
/** FUNCTIONS                                                                                    **/
/** Put the main logic of the application in functions and declare them in this section.         **/
/**************************************************************************************************/
function addNewList() {

  let listName = $listName.value;

  const list = {
    id: crypto.randomUUID(),
    title: listName,
    listContent: $entries,
  };

  shoppingLists.push(list)
  $listName.value = '';
  console.log(shoppingLists)
  console.log(list)
  createNewList(list);
};

function createNewList(list){

  console.log(list)

  const $shoppingList = document.createElement('div');
  $shoppingList.className = 'shoppingList';

  const $listTitle = document.createElement('h2');
  $listTitle.textContent = list.title;
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
    const index = shoppingLists.indexOf(list);
    shoppingLists.splice(index, 1);
    $shoppingList.remove();
  });

};

function openList(){
  console.log('Liste wird geöffnet.')
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
