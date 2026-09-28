const CACHE_NAME = 'vidyavistaar-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/constants.tsx',
  '/components/api.ts',
  '/components/SharedComponents.tsx',
  '/components/StudentDashboard.tsx',
  '/components/TeacherDashboard.tsx',
  '/components/AdminDashboard.tsx',
  '/components/AIAssistant.tsx',
  '/components/CareerViewpoint.tsx',
  '/manifest.json',
  '/assets/icon.svg',
  'https://cdn.tailwindcss.com',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache and caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // For navigation requests, use a network-first strategy.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // For other requests, use a cache-first strategy.
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // If not in cache, fetch from network, cache it, and return it.
      return fetch(event.request).then((networkResponse) => {
        // Don't cache profile pictures from picsum.photos
        if (event.request.url.includes('picsum.photos')) {
          return networkResponse;
        }

        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(error => {
        console.error('Fetch failed; network request for ', event.request.url, error);
      });
    })
  );
});
