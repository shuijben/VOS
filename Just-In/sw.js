self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('vos-store').then((cache) => cache.addAll([
      '*',
      'images/*.jpg',
      'fonts/*.woff',
      'fonts/*.woff2',
    ])),
  );
});

self.addEventListener('fetch', (e) => {
  console.log(`fetching - url: ${e.request.url}`);
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request)),
  );
});
