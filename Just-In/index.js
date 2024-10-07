const floors = ['sport', 'volleybal', 'tennis', 'voetbal', 'basketbal', 'bowling'];
const days = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
const imgElem = document.querySelector('img');
const headeroutput = document.querySelector('header .events');
const output = document.querySelector('main .events');
const datumWeergave = document.querySelector('.datum');
const weekdagWeergave = document.querySelector('.weekdag');
let confettiOn = false;
let isBirthday = false;

const birthdays = {
  '22-01': 'Jeske',
  '23-01': 'Eric',
  '26-01': 'Serge',
  '22-02': 'Jodi & Yohan',
  '27-03': 'Jessica',
  '15-04': 'Kitty',
  '16-04': 'Justus',
  '28-04': 'Esther',
  '06-05': 'Lieke',
  '15-06': 'Yannick',
  '06-07': 'Peter',
  '09-08': 'Luuk',
  '13-08': 'Jantine',
  '07-10': 'Danique',
  '06-10': 'Rianca',
  '09-10': 'Diederik', 
  '07-11': 'Marisssa', 
  '11-12': 'Sjors', 
}

let abortController = null;

const peilData = {
  startDate: new Date(),
  endDate: new Date(),
}

async function getEvents(startDate, endDate) {
  abortController = new AbortController();
  confettiOn = false;
  isBirthday?.remove?.();
  output.innerHTML = '';
  headeroutput.innerHTML = '<p class="event">Poot op de plaats, ik snuffel je locatie op</p>';
  const dayOfWeek = startDate.getDay();
  setDatumWeergave(startDate, days[dayOfWeek]);
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    headeroutput.innerHTML = '<p class="event">Weekend, geen werk!</p>';
    setImageSource('off');
    output.innerHTML = checkBirthday(startDate);
    return;
  }
  setImageSource('zoekt');
  const logicAppUrl = 'https://logicapp-ip-diederik.azurewebsites.net:443/api/office_connection/triggers/When_a_HTTP_request_is_received/invoke?api-version=2022-05-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=N6TLr4SIRyzvll5Z_jEoRvgW6jlLTBVlJGfIbuUdxHs';

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  try {
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
    signal: abortController.signal
    });
    
    let myEvents = '';
    const data = await response.json();
    if (data?.length > 1) {
      myEvents = data.map((event) => {
        const startDatum = new Date(event?.["Starttijd"]);
        const endDatum = new Date(event?.["Eindtijd"]);
        return `<p class="event">${processEvent(event)} van ${startDatum.getHours()}:${addZero(startDatum.getMinutes())} tot ${endDatum.getHours()}:${addZero(endDatum.getMinutes())}</p>`;
      }).join('');
    } else if (data?.length > 0) {
      myEvents = `<p class="event result">${processEvent(data[0])}</p>`;
    }
    if (myEvents) {
      headeroutput.innerHTML = myEvents
    } else {
      headeroutput.innerHTML = `<p class="event">Jammer! Je roedel zit niet in D, kwispel naar je burcht in B</p>`;
      setImageSource('burcht');
    } 
    output.innerHTML = checkBirthday(startDate);
  } catch (error) {
    console.log('Error fetching data:', error);
  }
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

function checkBirthday(date) {
  const birthday = birthdays[`${addZero(date.getDate())}-${addZero(date.getMonth() + 1)}`];
  if (birthday) {
    confettiOn = true;
    isBirthday = setupConfetti();
    return `<p class="event">Hoera, vandaag ${birthday.includes('&') ? 'zijn' : 'is'} ${birthday} jarig!</p>`;
  }
  confettiOn = false;
  isBirthday?.remove();
  return '';
}

function setDatumWeergave(date, weekdag) {
  weekdagWeergave.innerHTML = `${weekdag}`;
  datumWeergave.innerHTML = `${addZero(date.getDate())}-${addZero(date.getMonth() + 1)}-${date.getFullYear()}`;
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
  if (abortController) {
    abortController.abort('fetching new data');
  }
  peilData.startDate.setDate(peilData.startDate.getDate() + 1);
  peilData.endDate.setDate(peilData.endDate.getDate() + 1);
  
  getEvents(peilData.startDate, peilData.endDate);
});

const vorige = document.querySelector('.vorige');
vorige.addEventListener('click', () => {
  if (abortController) {
    abortController.abort('fetching new data');
  }
  peilData.startDate.setDate(peilData.startDate.getDate() - 1);
  peilData.endDate.setDate(peilData.endDate.getDate() - 1);
  
  getEvents(peilData.startDate, peilData.endDate);
});

// Confetti
function setupConfetti() {

  const canvas = document.createElement("canvas");
  imgElem.insertAdjacentElement('afterend', canvas);
  const context = canvas.getContext("2d");
  let W = canvas.clientWidth;
  let H = canvas.clientHeight;
  const maxConfettis = 150;
  const particles = [];

  const possibleColors = [
    "DodgerBlue",
    "OliveDrab",
    "Gold",
    "Pink",
    "SlateBlue",
    "LightBlue",
    "Gold",
    "Violet",
    "PaleGreen",
    "SteelBlue",
    "SandyBrown",
    "Chocolate",
    "Crimson"
  ];

  function randomFromTo(from, to) {
    return Math.floor(Math.random() * (to - from + 1) + from);
  }

  function confettiParticle() {
    this.x = Math.random() * W; // x
    this.y = Math.random() * H - H; // y
    this.r = randomFromTo(11, 33); // radius
    this.d = Math.random() * maxConfettis + 11;
    this.color =
    possibleColors[Math.floor(Math.random() * possibleColors.length)];
    this.tilt = Math.floor(Math.random() * 33) - 11;
    this.tiltAngleIncremental = Math.random() * 0.07 + 0.05;
    this.tiltAngle = 0;
    
    this.draw = function() {
      context.beginPath();
      context.lineWidth = this.r / 2;
      context.strokeStyle = this.color;
      context.moveTo(this.x + this.tilt + this.r / 3, this.y);
      context.lineTo(this.x + this.tilt, this.y + this.tilt + this.r / 5);
      return context.stroke();
    };
  }

  function Draw() {
    const results = [];
    
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    // context.clearRect(0, 0, W, window.innerHeight);
    if (confettiOn) {
      // Magical recursive functional love
      requestAnimationFrame(Draw);
      
      for (var i = 0; i < maxConfettis; i++) {
        results.push(particles[i].draw());
      }
      
      let particle = {};
      let remainingFlakes = 0;
      for (var i = 0; i < maxConfettis; i++) {
        particle = particles[i];
        
        particle.tiltAngle += particle.tiltAngleIncremental;
        particle.y += (Math.cos(particle.d) + 3 + particle.r / 2) / 2;
        particle.tilt = Math.sin(particle.tiltAngle - i / 3) * 15;
        
        if (particle.y <= H) remainingFlakes++;
        
        // If a confetti has fluttered out of view,
        // bring it back to above the viewport and let if re-fall.
        if (particle.x > W + 30 || particle.x < -30 || particle.y > H) {
          particle.x = Math.random() * W;
          particle.y = -30;
          particle.tilt = Math.floor(Math.random() * 10) - 20;
        }
      }
    }    
    return results;
  }

  
  // Push new confetti objects to `particles[]`
  for (let i = 0; i < maxConfettis; i++) {
    particles.push(new confettiParticle());
  }
  
  // Initialize
  canvas.width = W;
  canvas.height = H;
  Draw();
  return canvas;
}

window.addEventListener(
  "resize",
  function() {
    if (confettiOn) {
      confettiOn = false;
      isBirthday?.remove?.();
      confettiOn = true;
      isBirthday = setupConfetti();
    }
  },
  false
);