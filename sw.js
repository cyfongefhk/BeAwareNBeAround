const CACHE_NAME = 'efhk-first-aid-v1';

// The essential files to save to the phone immediately upon installation
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

// 1. INSTALL EVENT: This fires the first time the user opens the app.
// It downloads and saves the ASSETS_TO_CACHE list to the phone's local storage.
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            console.log('[Service Worker] Caching essential assets');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting(); // Forces the waiting service worker to become the active one
});

// 2. ACTIVATE EVENT: This fires when the app is updated.
// If you change CACHE_NAME (e.g., to v2), this will delete the old cache to free up space.
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Clearing old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// 3. FETCH EVENT: This intercepts all network requests made by the app.
self.addEventListener('fetch', event => {
    // We only want to intercept standard page assets, not the YouTube iframe or external tracking
    if (event.request.method !== 'GET') return;
    
    // Specifically skip YouTube requests to prevent caching errors with the video
    if (event.request.url.includes('youtube.com')) return;

    event.respondWith(
        caches.match(event.request)
        .then(cachedResponse => {
            // Strategy: "Cache First, Fallback to Network"
            // If the file is in the cache (offline), serve it immediately.
            if (cachedResponse) {
                return cachedResponse;
            }

            // If it is NOT in the cache (like your external Foundation logo), 
            // go out to the internet, fetch it, and dynamically cache it for next time.
            return fetch(event.request).then(networkResponse => {
                // Ensure we only cache valid responses
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && networkResponse.type !== 'cors') {
                    return networkResponse;
                }

                // Clone the response because it can only be consumed once
                const responseToCache = networkResponse.clone();

                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseToCache);
                });

                return networkResponse;
            }).catch(() => {
                // This catch fires if the user is completely offline and the asset isn't cached.
                // Since our main index.html is cached, the app will still function.
                console.log('[Service Worker] Fetch failed; returning offline page instead.');
            });
        })
    );
});