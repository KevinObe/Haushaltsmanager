/**************************************************************************************************/
/** SETTINGS                                                                                     **/
/** Declare basic settings of the application in this section.                                   **/
/**************************************************************************************************/



/**************************************************************************************************/
/** ELEMENTS                                                                                     **/
/** Get access to all relevant elements of the DOM in this section.                              **/
/**************************************************************************************************/
const $loginBtn = document.querySelector('#loginBtn');
const $registerBtn = document.querySelector('#registerBtn');
//const $background = document.querySelector('#background');
//const $image = document.querySelector('#backgroundImage1');
/**************************************************************************************************/
/** RUNTIME                                                                                      **/
/** Declare additial variables for the application in this section.                              **/
/**************************************************************************************************/



/**************************************************************************************************/
/** FUNCTIONS                                                                                    **/
/** Put the main logic of the application in functions and declare them in this section.         **/
/**************************************************************************************************/

// function renderBackground () {
//   if(window.matchMedia("(min-width: 800px").matches){
//     const base64Image = localStorage.getItem('/imagesss/vegetables.background.web.jpg');
//     $body.style.backgroundImage = `url(${base64Image})`;
//   } else {
//     const base64Image = localStorage.getItem('/imagesss/933a88539897ac96d71b65c27122b3ec.jpg');
//     $body.style.backgroundImage = `url(${base64Image})`;
//   };
// };

// async function loadImg() {
//   const response = await fetch('/api/v1/cachedImg', {
//     responseType: 'blob'
//   });
//   console.log(response)
//   const blob = await response.blob();
//   const url = URL.createObjectURL(blob);

//   // Assuming $img is your image element
//   console.log(url);
//   $image.src = url;
// }
// loadImg();
/**************************************************************************************************/
/** EVENTS                                                                                       **/
/** Combine the Elements from above with the declared Functions in this section.                 **/
/**************************************************************************************************/
$loginBtn.addEventListener('click', () => {
  window.location.href = 'login.html';
});

$registerBtn.addEventListener('click', () => {
  window.location.href = '/register/register.html';
});

// window.addEventListener('resize', renderBackground);
/**************************************************************************************************/
/** SETUP                                                                                        **/
/** If there are any additional steps to take in order to prepare the app, so use this section.  **/
/**************************************************************************************************/
