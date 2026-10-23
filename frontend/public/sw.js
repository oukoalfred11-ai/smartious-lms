/*
 * Smartious service worker: offline and low-bandwidth support.
 *
 * Cache names carry the build id: scripts/seo-static.mjs replaces
 * __BUILD_ID__ in dist/sw.js on every build, so each deploy installs a new
 * worker and `activate` deletes every older Smartious cache.
 *
 * Strategy:
 *  - API calls (/api/...) and sockets are NEVER intercepted.
 *  - Page navigations go to the network. Only the app shell ("/") is kept,
 *    refreshed on install and on each successful load of "/", and served
 *    only when the network fails. Individual pages are not stored.
 *  - Hashed Vite assets (/assets/*) are cache-first: their file names change
 *    whenever their content does, so a cached copy is always correct.
 *  - 3D model files (/models/*.glb) are cache-first in a cache that survives
 *    deploys: they are large, and their names carry a version (skeleton-v1.glb),
 *    so a student downloads each one once.
 *  - Every other same-origin GET (PDFs, images, /brand/*, /blog/*.jpg,
 *    /pdfjs/*, fonts) is stale-while-revalidate: served from cache when
 *    present, refreshed in the background, capped in size.
 *  - Cross-origin requests are left to the browser. Opaque responses are
 *    never cached (their status is unknown and they inflate quota).
 */
const VERSION = '__BUILD_ID__';
const SHELL = 'sm-shell-' + VERSION;
const ASSETS = 'sm-assets-' + VERSION;
const STATIC = 'sm-static-' + VERSION;
const STATIC_MAX = 80;
const MODELS = 'sm-models';
const CURRENT = [SHELL, ASSETS, STATIC, MODELS];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(SHELL)
      .then((c) => c.add(new Request('/', { cache: 'reload' })))
      .catch(() => {})
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('sm-') && !CURRENT.includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function trimCache(name, max) {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

const cacheable = (res) => res && res.ok && res.type === 'basic';

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Cross-origin (storage, fonts, analytics): let the browser handle it.
  if (url.origin !== self.location.origin) return;

  // Live data: never cached, never intercepted.
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/socket.io')) return;
  // Partial (Range) requests for media and large PDFs go straight through.
  if (req.headers.has('range')) return;

  // Navigations: network; the shell is the offline fallback only.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (url.pathname === '/' && cacheable(res)) {
            const copy = res.clone();
            caches.open(SHELL).then((c) => c.put('/', copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.open(SHELL).then((c) => c.match('/')))
    );
    return;
  }

  // Hashed build assets and versioned 3D models: cache first.
  if (url.pathname.startsWith('/models/') && url.pathname.endsWith('.glb')) {
    e.respondWith(
      caches.open(MODELS).then((cache) => cache.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (cacheable(res)) cache.put(req, res.clone()).then(() => trimCache(MODELS, 12)).catch(() => {});
        return res;
      })))
    );
    return;
  }
  if (url.pathname.startsWith('/assets/')) {
    e.respondWith(
      caches.open(ASSETS).then((cache) => cache.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (cacheable(res)) cache.put(req, res.clone()).catch(() => {});
        return res;
      })))
    );
    return;
  }

  // Other same-origin files: stale-while-revalidate.
  e.respondWith(
    caches.open(STATIC).then((cache) => cache.match(req).then((hit) => {
      const network = fetch(req).then((res) => {
        if (cacheable(res)) cache.put(req, res.clone()).then(() => trimCache(STATIC, STATIC_MAX)).catch(() => {});
        return res;
      });
      if (hit) { e.waitUntil(network.catch(() => {})); return hit; }
      return network;
    }))
  );
});
