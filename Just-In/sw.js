self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('vos-store').then((cache) => cache.addAll([
      './icon/fox-icon.png',
      './icon/fox-icon-512.png',
      './images/vos0.jpg',
      './images/vos1.jpg',
      './images/vos2.jpg',
      './images/vos3.jpg',
      './images/vos4.jpg',
      './images/vos5.jpg',
      './images/vosburcht.jpg',
      './images/vosKerst.jpg',
      './images/vosNieuwjaar.jpg',
      './images/vosthuis.jpg',
      './images/vosoff.jpg',
      './images/voszoekt.jpg',
      './fonts/TheMixB4-7_Bold.woff',
      './fonts/TheMixB4-7_Bold.woff2',
      './fonts/TheSansB4-5_Plain.woff',
      './fonts/TheSansB4-5_Plain.woff2',
      './fonts/TheSansB4-5iPlainItalic.woff',
      './fonts/TheSansB4-5iPlainItalic.woff2',
      './fonts/TheSansB4-7_Bold.woff',
      './fonts/TheSansB4-7_Bold.woff2',
    ])),
  );
});

self.addEventListener('fetch', (event) => {
  const destination = event?.request?.destination || '';
  
  if (['image', 'font'].includes(destination)) {
    const url = event.request.url;
    console.log(`fetching - url: ${url}, destination: ${event.request.destination}`);
    event.respondWith(caches.open('vos-store').then((cache) => {
      // Go to the cache first
      return cache.match(event.request.url).then((cachedResponse) => {
        console.log(cachedResponse ? `found in cache: ${url}` : `not found in cache: ${url}`);
        // Return a cached response if we have one
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise, hit the network
        return fetch(event.request).then((fetchedResponse) => {
          // Add the network response to the cache for later visits
          console.log(`caching new resource: ${url}`);
          cache.put(event.request, fetchedResponse.clone());

          // Return the network response
          return fetchedResponse;
        });
      });
    }));
  } else {
    console.log(`not handling fetch for destination: ${destination}`);
    return;
  }
});
