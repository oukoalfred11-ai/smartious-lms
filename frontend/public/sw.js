/*
 * Smartious service worker: offline and low-bandwidth support, phase 1.
 *
 * Strategy, deliberately conservative:
 *  - API calls (/api/...) are NEVER cached: live data and anything behind
 *    authentication always goes to the network.
 *  - Page navigations are network-first with an offline fallback to the
 *    cached app shell, so the app opens even with no connection.
 *  - Hashed static assets (JS/CSS/fonts/images) are cache-first: Vite
 *    fingerprints them, so a cached copy is always the right copy.
 *  - Media and documents the student has already opened (lesson notes,
 *    PDFs, recordings from the school's storage) are cached with a small
 *    LRU cap, so revisiting them costs no data and works offline.
 */
const SHELL = 'sm-shell-v1';
const ASSETS = 'sm-assets-v1';
const MEDIA = 'sm-media-v1';
const MEDIA_MAX = 60;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(['/'])).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => ![SHELL, ASSETS, MEDIA].includes(k)).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

async function trimCache(name, max) {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  if (keys.length > max) await cache.delete(keys[0]);
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Live data: never cached, never intercepted.
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/socket.io')) return;

  // Navigations: network first, offline fallback to the app shell.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(SHELL).then((c) => c.put('/', copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match('/'))
    );
    return;
  }

  // Same-origin static assets: cache first (Vite fingerprints them).
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(ASSETS).then((c) => c.put(req, copy)).catch(() => {}); }
        return res;
      }))
    );
    return;
  }

  // Cross-origin media/documents (school storage, fonts): cache what has
  // been viewed, with an LRU cap so the phone is never filled up.
  if (/\.(pdf|png|jpe?g|webp|gif|mp4|webm|mp3|m4a|woff2?)($|\?)/i.test(url.pathname + url.search) ||
      req.destination === 'video' || req.destination === 'audio' || req.destination === 'font') {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok || res.type === 'opaque') {
          const copy = res.clone();
          caches.open(MEDIA).then((c) => c.put(req, copy)).then(() => trimCache(MEDIA, MEDIA_MAX)).catch(() => {});
        }
        return res;
      }).catch(() => caches.match(req)))
    );
  }
});
