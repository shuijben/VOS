const images = ['fox1', 'fox2', 'fox3', 'fox4'];
const imgElem = document.querySelector('img');

function randomValueFromArray(array) {
  const randomNo = Math.floor(Math.random() * array.length);
  return array[randomNo];
}

async function getEvents() {
  const logicAppUrl = 'https://logicapp-ip-diederik.azurewebsites.net:443/api/office_connection/triggers/When_a_HTTP_request_is_received/invoke?api-version=2022-05-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=N6TLr4SIRyzvll5Z_jEoRvgW6jlLTBVlJGfIbuUdxHs';
  const startDate = new Date();
  const endDate = new Date();

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  const response = await fetch(logicAppUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      organizer: 'fpa.ict.sales@cz.nl',
    }),
  });

  let myEvents = `<p class="event">Geen events gevonden</p>`;
  const data = await response.json();
  if (data?.[0]?.["Locatie"]) {
    myEvents = '';
    data.map((event) => {
      let location = event?.["Locatie"];
      let dIndex = location?.indexOf('TD0');
      let floor = '';
      if (dIndex > -1) {
        const dStart = dIndex + 3;
        floor = location.substring(dStart, dStart + 1);
        myEvents += `<p class="event">gebouw D, verdieping ${floor}</p>`;
      } else if (location?.indexOf('TB0') > -1) {
        myEvents += `<p class="event">gebouw B om ${event.Starttijd}</p>`;
      } else {
        myEvents += '';
      }
    });
  }
  document.querySelector('.events').innerHTML = myEvents || `<p class="event">Geen Locatie gevonden, wat dacht je van thuis werken?</p>`;
}

setInterval(() => {
  const randomChoice = randomValueFromArray(images);
  imgElem.src = `images/${randomChoice}.jpg`;
}, 2000);

// Register service worker to control making site work offline

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('sw.js')
    .then(() => { console.log('Service Worker Registered'); });
}

// Code to handle install prompt on desktop

let deferredPrompt;
const addBtn = document.querySelector('.add-button');

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Update UI to notify the user they can add to home screen
  addBtn.style.display = 'block';

  addBtn.addEventListener('click', () => {
    // hide our user interface that shows our add 2 homescreen button
    addBtn.style.display = 'none';
    // Show the prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the add 2 homescreen prompt');
      } else {
        console.log('User dismissed the add 2 homescreen prompt');
      }
      deferredPrompt = null;
    });
  });
});

getEvents();
