const floors = ['begane grond', 'volleybal', 'tennis', 'voetbal', 'basketbal', 'bowling'];
const imgElem = document.querySelector('img');
const output = document.querySelector('.events');

const peilData = {
  startDate: new Date(),
  endDate: new Date(),
}

async function getEvents(startDate, endDate) {
  output.innerHTML = '<p class="event">Even geduld, ik ben de locatie aan het zoeken...</p>';
  setImageSource(0);
  const logicAppUrl = 'https://logicapp-ip-diederik.azurewebsites.net:443/api/office_connection/triggers/When_a_HTTP_request_is_received/invoke?api-version=2022-05-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=N6TLr4SIRyzvll5Z_jEoRvgW6jlLTBVlJGfIbuUdxHs';

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

  let myEvents = '';
  const data = await response.json();
  if (data?.length > 0) {
    myEvents = data.map((event) => `<p class="event">${processEvent(event)}</p>`).join('');
  }
  output.innerHTML = myEvents || `<p class="event">Niet in D, zoek een plekje in B</p>`;
}

function filterInt(value) {
  if (/^[-+]?(\d+|Infinity)$/.test(value)) {
    return Number(value);
  } else {
    return 0; // return 0 instead of NaN so it can be used as falsy
  }
}

function addZero(i) {
  if (i < 10) { i = "0" + i }
  return i;
}


function processEvent(event) {
  let location = event?.["SportType"];
  let floor = floors?.indexOf(location?.toLowerCase());
  if (floor > -1) {
    setImageSource(floor);
    return `${location}`;
  } else {
    return '';
  }
}

function setImageSource(floor) {
  imgElem.src = `images/vos${floor}.jpg`;
}

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

getEvents(peilData.startDate, peilData.endDate);

const volgende = document.querySelector('.volgende');
volgende.addEventListener('click', () => {
  peilData.startDate.setDate(peilData.startDate.getDate() + 1);
  peilData.endDate.setDate(peilData.endDate.getDate() + 1);
  
  getEvents(peilData.startDate, peilData.endDate);
});