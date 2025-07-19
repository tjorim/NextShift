// NextShift Service Worker
const CACHE_NAME = 'nextshift-v3.0.0';
const APP_VERSION = '3.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/app.min.js',
    '/manifest.json',
    '/assets/icons/icon-192.png',
    '/assets/icons/icon-512.png',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
    'https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js',
    'https://cdn.jsdelivr.net/npm/dayjs@1.11.10/plugin/weekOfYear.js',
    'https://cdn.jsdelivr.net/npm/dayjs@1.11.10/plugin/timezone.js',
    'https://cdn.jsdelivr.net/npm/dayjs@1.11.10/plugin/utc.js'
];

// Install event - cache resources
self.addEventListener('install', function(event) {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Service Worker: Caching files');
                return cache.addAll(urlsToCache);
            })
            .then(function() {
                console.log('Service Worker: All files cached');
                return self.skipWaiting();
            })
            .catch(function(error) {
                console.log('Service Worker: Cache failed', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(function() {
            console.log('Service Worker: Activated');
            return self.clients.claim();
        })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', function(event) {
    // Skip non-HTTP(S) requests (chrome-extension, etc.)
    if (event.request.url.startsWith('chrome-extension://') ||
        event.request.url.startsWith('moz-extension://') ||
        event.request.url.startsWith('safari-extension://') ||
        (!event.request.url.startsWith('http://') && !event.request.url.startsWith('https://'))) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // Return cached version or fetch from network
                if (response) {
                    console.log('Service Worker: Serving from cache', event.request.url);
                    return response;
                }

                console.log('Service Worker: Fetching from network', event.request.url);
                return fetch(event.request).then(function(response) {
                    // Check if we received a valid response
                    if (!response || response.status !== 200) {
                        return response;
                    }

                    // Clone the response as it can only be consumed once
                    const responseToCache = response.clone();

                    // Add successful responses to cache (with error handling)
                    caches.open(CACHE_NAME)
                        .then(function(cache) {
                            return cache.put(event.request, responseToCache);
                        })
                        .catch(function(error) {
                            console.log('Service Worker: Cache put failed', error);
                        });

                    return response;
                }).catch(function(error) {
                    console.log('Service Worker: Fetch failed', error);

                    // Return a fallback response for HTML requests when offline
                    if (event.request.headers.get('accept')?.includes('text/html')) {
                        return caches.match('/index.html');
                    }

                    throw error;
                });
            }
            )
    );
});

// Background sync for future features
self.addEventListener('sync', function(event) {
    console.log('Service Worker: Background sync', event.tag);

    if (event.tag === 'shift-data-sync') {
        event.waitUntil(
            // Future: sync shift data or user preferences
            Promise.resolve()
        );
    }
});

// Push notifications for future features
self.addEventListener('push', function(event) {
    console.log('Service Worker: Push received');

    const options = {
        body: event.data ? event.data.text() : 'NextShift notification',
        icon: '/assets/icons/icon-192.png',
        badge: '/assets/icons/icon-192.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '1'
        },
        actions: [
            {
                action: 'view',
                title: 'View Schedule',
                icon: '/assets/icons/icon-192.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/assets/icons/icon-192.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('NextShift', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
    console.log('Service Worker: Notification clicked', event.action);

    event.notification.close();

    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Message handling for communication with main app
self.addEventListener('message', function(event) {
    console.log('Service Worker: Message received', event.data);

    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({
            version: CACHE_NAME,
            appVersion: APP_VERSION
        });
    }
});
