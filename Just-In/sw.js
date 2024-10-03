self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('fox-store').then((cache) => cache.addAll([
      '/',
      '/index.html',
      '/index.js',
      '/style.css',
      '/images/vos0.jpg',
      '/images/vos1.jpg',
      '/images/vos2.jpg',
      '/images/vos3.jpg',
      '/images/vos4.jpg',
      '/images/vos5.jpg',
      '/fonts/TheMixB4-7_Bold.woff',
      '/fonts/TheMixB4-7_Bold.woff2',
      '/fonts/TheSansB4-5_Plain.woff',
      '/fonts/TheSansB4-5_Plain.woff2',
      '/fonts/TheSansB4-5iPlainItalic.woff',
      '/fonts/TheSansB4-5iPlainItalic.woff2',
      '/fonts/TheSansB4-7_Bold.woff',
      '/fonts/TheSansB4-7_Bold.woff2',
    ])),
  );
});

self.addEventListener('fetch', (e) => {
  console.log(e.request.url);
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request)),
  );
});
