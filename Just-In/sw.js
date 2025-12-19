self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('vos-store').then((cache) => cache.addAll([
      './index.html',
      './index.js',
      './style.css',
      './favicon.ico',
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

self.addEventListener('fetch', (e) => {
  const url = e?.request?.url || '';

  if (url) {
    console.log(`fetching - url: ${url}`);
    e.respondWith(caches.open('vos-store').then((cache) => {
      //respond to get favicon.ico requests
      if (url.endsWith('favicon.ico')) {
        console.log('favicon requested, respond with the one cached');
        return cache.match('./favicon.ico').then((cachedResponse) => cachedResponse);
      }
      // Go to the cache first
      return cache.match(e.request.url).then((cachedResponse) => {
        // Return a cached response if we have one
        if (cachedResponse) {
          console.log(cachedResponse ? `found in cache: ${url}` : `not found in cache: ${url}`);
          return cachedResponse;
        }

        // Otherwise, hit the network
        return fetch(e.request).then((fetchedResponse) => {
          // Add the network response to the cache for later visits
          cache.put(e.request, fetchedResponse.clone());

          // Return the network response
          return fetchedResponse;
        });
      });
    }));
  } else {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    }));
});
