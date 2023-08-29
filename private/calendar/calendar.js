'use strict';

/**************************************************************************************************/
/** SETTINGS                                                                                     **/
/** Declare basic settings of the application in this section.                                   **/
/**************************************************************************************************/
let date = new Date();
let currentYear = date.getFullYear();
let currentMonth = date.getMonth(); //returns 0 to 11!

const months = ['Jänner', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'Novenber', 'Dezember'];


/**************************************************************************************************/
/** ELEMENTS                                                                                     **/
/** Get access to all relevant elements of the DOM in this section.                              **/
/**************************************************************************************************/
const $currentDate = document.querySelector('.currentDate');
const $days = document.querySelector('.days');
const $previousIcon = document.querySelector('.previous');
const $nextIcon = document.querySelector('.next');

/**************************************************************************************************/
/** RUNTIME                                                                                      **/
/** Declare additial variables for the application in this section.                              **/
/**************************************************************************************************/
upddateCalendarData();


/**************************************************************************************************/
/** FUNCTIONS                                                                                    **/
/** Put the main logic of the application in functions and declare them in this section.         **/
/**************************************************************************************************/
function upddateCalendarData() {
  let firstDay = new Date(currentYear, currentMonth, 1).getDay(); // getDay() returns the day of the week (0 - 6), parameter 1 is getting the first day of the current month's day of the week;
  let lastDateCurrMonth = new Date(currentYear, currentMonth + 1, 0).getDate(); // month + 1 is next month, parameter 0 means 1 day less, which is the last day in the current month => getDate method gives back the day;
  let lastDatePrevMonth = new Date(currentYear, currentMonth, 0).getDate(); //returns the last day of the previous month with the parameter 0;
  let lastDay = new Date(currentYear, currentMonth, lastDateCurrMonth).getDay(); // gets the weekday Index of the last day of the month;

  let day = '';

  for(let i = firstDay; i > 0; i--){
    day += `<li class="inactive">${lastDatePrevMonth - i + 1}</li>`; // last day of prev month - first day of month's weekday index + 1 returns all the days back until the last sunday (index of 0 by the getDay() method) and inserts them into the HTML calendar;
  };

  for(let i = 1; i <= lastDateCurrMonth; i++) {
    //setting the class active on today in the loop by checking if the day matches the current date, month and year otherwise set no class;
    let today = i === date.getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear() ? "active" : "";
    day += `<li class="${today}">${i}</li>`; // gives a day as a li tag back to insert it into the calender for each day of the current month;
  };

  for(let i = lastDay; i < 6; i++){
    day += `<li class="inactive">${i - lastDay + 1}</li>`; //uses the weekday index to fill up days until the next saturday, (index of 6);
  };

  $currentDate.textContent = `${months[currentMonth]} ${currentYear}`;
  $days.innerHTML = day;

  const $li = document.querySelectorAll('.days li');

  $li.forEach(li => {
    li.addEventListener('click', function () {
      let clickedDay = {};

      clickedDay = {
        id: crypto.randomUUID(),
        date:`${li.textContent} ${$currentDate.textContent}`,
        eventTitle: '',
        eventTime: '',
      }
        console.log(clickedDay)

    const request = new XMLHttpRequest();
    request.open('POST', `/api/v1/calendarEvents/${clickedDay.id}`);
    request.send(JSON.stringify(clickedDay));

    request.addEventListener('load', () => {
      console.log(request.response);
      window.location.href = 'events.html';
    })
    });
  });

};

/**************************************************************************************************/
/** EVENTS                                                                                       **/
/** Combine the Elements from above with the declared Functions in this section.                 **/
/**************************************************************************************************/
$previousIcon.addEventListener('click', () => {
  currentMonth = currentMonth - 1; // shows previous Month and days in the HTML;

  if(currentMonth < 0){ // if index < 0 -> old year needs to be shown, create a new Date with the old year and month and update the calendar with it;
    date = new Date(currentYear, currentMonth);
    currentYear = date.getFullYear();
    currentMonth = date.getMonth();
  } else {
    date = new Date(); //else go with the new date as it was at the beginning for the current year, no changes;
  };

  upddateCalendarData();
});
$nextIcon.addEventListener('click', () => {
  currentMonth = currentMonth + 1; // shows next Month and days in the HTML;

  if(currentMonth > 11){ // if index > 11 -> new year starts, create a new Date with the new year and month and update the calendar with it;
    date = new Date(currentYear, currentMonth);
    currentYear = date.getFullYear();
    currentMonth = date.getMonth();
  } else {
    date = new Date(); //else go with the new date as it was at the beginning for the current year, no changes;
  };

  upddateCalendarData();
});

/**************************************************************************************************/
/** SETUP                                                                                        **/
/** If there are any additional steps to take in order to prepare the app, so use this section.  **/
/**************************************************************************************************/
