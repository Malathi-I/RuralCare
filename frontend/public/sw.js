/* RuralCare service worker.
 *
 * Goals:
 *  - let the app shell load offline
 *  - cache safe PUBLIC content (doctors, healthcare centers, health articles)
 *  - NEVER cache anything private: auth, appointments, admin data
 *
 * The rules below are allow-list based. Anything not explicitly listed is
 * simply never written to a cache.
 */

const VERSION = 'ruralcare-v1';
const SHELL_CACHE = `${VERSION}-shell`;
const DATA_CACHE = `${VERSION}-data`;

const SHELL_ASSETS = ['/', '/index.html', '/manifest.json', '/icon.svg'];

// Only these public read endpoints may be cached.
const CACHEABLE_PATHS = [
  '/api/doctors',
  '/api/healthcare-centers',
  '/api/health-information',
];

// Anything that could contain private data must never be cached.
const NEVER_CACHE = [
  '/api/auth',
  '/api/appointments',
  '/api/admin',
  '/api/doctors/me',
];

const isCacheableRequest = (url) => {
  const { pathname, search } = url;

  if (NEVER_CACHE.some((path) => pathname.startsWith(path))) return false;
  if (pathname.startsWith('/api/auth')) return false;
  if (search.includes('token')) return false;

  return CACHEABLE_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
};

// Install: pre-cache the app shell.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: remove caches from older versions.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !key.startsWith(VERSION))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Never touch non-GET requests (logins, bookings, admin writes).
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // 1. API calls: network first, fall back to cache for public data only.
  if (url.pathname.startsWith('/api/')) {
    if (!isCacheableRequest(url)) return;

    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(DATA_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() =>
          caches.match(request).then(
            (cached) =>
              cached ||
              new Response(
                JSON.stringify({ message: 'You are offline. This content is not available yet.' }),
                { status: 503, headers: { 'Content-Type': 'application/json' } }
              )
          )
        )
    );
    return;
  }

  // 2. Navigations: serve the cached shell so the app opens offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // 3. Static assets: cache first, they rarely change.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response && response.ok) {
              const copy = response.clone();
              caches.open(SHELL_CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          })
      )
    );
  }
});