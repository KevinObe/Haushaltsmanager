'use strict';

const $customAlert = document.querySelector("#customAlert");
const $closeBtn = document.querySelector(".close");
const $alertText = document.querySelector('#alertText');

function customAlert() {
  $customAlert.style.visibility = 'visible';
  $customAlert.style.display = "block";
  $customAlert.classList.add('show');
  setTimeout(hideAlert, 3000);
}

function hideAlert() {
  $customAlert.classList.remove('show');
  $customAlert.style.visibility = "hidden";
  // $customAlert.style.display = "none";
};

$closeBtn.addEventListener("click", () => {
  $customAlert.classList.remove('show');
  // $customAlert.style.display = "none";
  $customAlert.style.visibility = "hidden";
});

/*
  <div id="customAlert" class="modal">
    <div class="modal-content">
      <span class="close">&times;</span>
      <p id="alertText"></p>
    </div>
  </div>

    <link rel="stylesheet" href="../../alert.css">
    <script src="../../alert.js" defer></script>

    $alertText.textContent = `Fehler beim Laden der Einträge.`;
    customAlert();
*/
