const CACHE_NAME = 'kagami-offline-chapters';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  // Cache proxy for MangaDex and fallback chapter page image files
  if (url.includes('data-saver') || url.includes('/data/') || (url.includes('/manga/') && /\.(png|jpg|jpeg|webp)$/i.test(url))) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request)
          .then((networkResponse) => {
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && networkResponse.type !== 'cors') {
              return networkResponse;
            }
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
            return networkResponse;
          })
          .catch(() => {
            // Return failure fallback
            return new Response('Offline resource not cached', { status: 503 });
          });
      })
    );
  }
});
