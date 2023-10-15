'use strict';

/**************************************************************************************************/
/** SETTINGS                                                                                     **/
/** Declare basic settings of the application in this section.                                   **/
/**************************************************************************************************/

console.log('hallo')

/**************************************************************************************************/
/** ELEMENTS                                                                                     **/
/** Get access to all relevant elements of the DOM in this section.                              **/
/**************************************************************************************************/
const $submitBtn = document.querySelector('.item-3');
const $groupname = document.querySelector('.groupname');
const $password = document.querySelector('.password');
const $navBtn = document.querySelector('.navBtn');

/**************************************************************************************************/
/** RUNTIME                                                                                      **/
/** Declare additial variables for the application in this section.                              **/
/**************************************************************************************************/



/**************************************************************************************************/
/** FUNCTIONS                                                                                    **/
/** Put the main logic of the application in functions and declare them in this section.         **/
/**************************************************************************************************/



/**************************************************************************************************/
/** EVENTS                                                                                       **/
/** Combine the Elements from above with the declared Functions in this section.                 **/
/**************************************************************************************************/
$submitBtn.addEventListener('click', async () => {
  const group = {
    groupname: $groupname.value,
    password: $password.value,
  }

  const response = await fetch('/api/v1/createGroup', {
    method: 'POST',
    body: JSON.stringify(group),
  });
  console.log(`${response.status} ${response.statusText}`);
  if(response.status === 204 || response.status === 200){
    window.location.href = 'joined.html';
  } else {
    $alertText.textContent = `Fehler beim erstellen der Gruppe. Keine Leer oder Sonderzeichen erlaubt.`;
    customAlert();
  }
})();

$navBtn.addEventListener('click', () => window.location.href = '../home.html');
/**************************************************************************************************/
/** SETUP                                                                                        **/
/** If there are any additional steps to take in order to prepare the app, so use this section.  **/
/**************************************************************************************************/
