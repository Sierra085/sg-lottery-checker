const CACHE_NAME = 'toto-checker-cache-v5'; // Bump version
const FILES_TO_CACHE = [
    '/',
    '/manifest.json',
    '/privacy.html',
    '/icons/icon.svg',
    '/icons/icon-192.png',
    '/icons/icon-512.png'
];

// Pre-cache the main app shell files during installation
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache and caching app shell');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// Clean up old caches and take control immediately
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Force the SW to take control of open clients
    );
});


// Intercept fetch requests and serve from cache if available
self.addEventListener('fetch', (event) => {
  event.respondWith(
    // Try to find the response in the cache first
    caches.match(event.request).then((response) => {
      // If a cached response is found, return it
      if (response) {
        return response;
      }

      // If the request is not in the cache, fetch it from the network
      return fetch(event.request).then((networkResponse) => {
        // We need to clone the response because it's a stream and can only be consumed once
        const responseToCache = networkResponse.clone();

        caches.open(CACHE_NAME).then((cache) => {
            // Only cache successful GET requests. This prevents caching errors or API calls.
            if(event.request.method === 'GET' && networkResponse.status === 200) {
                cache.put(event.request, responseToCache);
            }
        });

        // Return the fresh response from the network
        return networkResponse;
      }).catch(() => {
        // If the network request fails (e.g., user is offline), 
        // for navigation requests, fall back to the cached index.html.
        if (event.request.mode === 'navigate') {
            return caches.match('/');
        }
      });
    })
  );
});