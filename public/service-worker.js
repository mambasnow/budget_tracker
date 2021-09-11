const CACHE_NAME = "static-cache";
const DATA_CACHE_NAME = "data-cache";

const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/index.js',
  '/service-worker.js',
  '/db.js',
  '/styles.css',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/manifest.webmanifest'
];

// Install and register service worker
self.addEventListener('install', (event) => {

    // Pre cache image data 
    event.waitUntil(
        caches.open(DATA_CACHE_NAME).then((cache) => {
            cache.add('/api/transaction');
        })
    )

    // Pre cache all static assets 
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            cache.addAll(FILES_TO_CACHE)
        })
    )

    // Tells the browser to activate this service worker immediately once it has finished installing
    self.skipWaiting();
})

// Activate the service worker and remove old data from the cache
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log("Removing old cache", key);
                        return caches.delete(key)
                    }
                })
            )
        })
    ) // Activates it as the only service worker controlling the thread
    self.clients.claim(); 
})

// Enable the service worker to intercept network requests
self.addEventListener('fetch', (event) => {

    // Cache successful requests to the API
    // If it hits the api route, it will open the data cache, get the real response
    if (event.request.url.includes('/api')) {
        event.respondWith(
            caches.open(DATA_CACHE_NAME).then((cache) => {
                return fetch(event.request) 
                .then((response) => {
                    if (response.status === 200) {
                        cache.put(event.request.url, response.clone());
                    }
                    return response;
                })
                .catch((error) => {
                    return cache.match(event.request);
                })
            })
        )
        return;
    }

    // If the request is not for the api, serve static files from the cache
    // If the request is not in the cache, continue the fetch request
    event.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.match(event.request).then((response) => {
                return response || fetch(event.request)
            })
        })
    )