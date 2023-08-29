'use strict';

/**************************************************************************************************/
/** SETTINGS                                                                                     **/
/** Declare basic settings of the application in this section.                                   **/
/**************************************************************************************************/



/**************************************************************************************************/
/** ELEMENTS                                                                                     **/
/** Get access to all relevant elements of the DOM in this section.                              **/
/**************************************************************************************************/
const $menuToggler = document.querySelector('.menuToggler');
const $mobileMenu = document.querySelector('#mobile-menu');
const $closeButton = document.querySelector('#closeButton');

const logoutBtn = document.querySelector('#logoutBtn');

/**************************************************************************************************/
/** RUNTIME                                                                                      **/
/** Declare additial variables for the application in this section.                              **/
/**************************************************************************************************/



/**************************************************************************************************/
/** FUNCTIONS                                                                                    **/
/** Put the main logic of the application in functions and declare them in this section.         **/
/**************************************************************************************************/
function logoutUser() {
  const request = new XMLHttpRequest();
  request.open('GET', '/logout.html');
  request.send();
}


/**************************************************************************************************/
/** EVENTS                                                                                       **/
/** Combine the Elements from above with the declared Functions in this section.                 **/
/**************************************************************************************************/
$menuToggler.addEventListener('click', () => {
  $mobileMenu.className = 'inactive' ? 'active' : 'inactive';
});

$closeButton.addEventListener('click', () => {
  $mobileMenu.className = 'inactive';
});

logoutBtn.addEventListener('click', logoutUser);

/**************************************************************************************************/
/** SETUP                                                                                        **/
/** If there are any additional steps to take in order to prepare the app, so use this section.  **/
/**************************************************************************************************/
