/* FieldForms service worker — local-first build.
   Caches the app shell so it opens with no internet after one online visit.
   jsPDF is now bundled locally (./jspdf.umd.min.js), so the app makes
   NO outside network requests at all. */
const CACHE = 'fieldforms-local-v3';
const SHELL = [
  './',
  './index.html',
  './welcome.html',
  './manifest.webmanifest',
  './jspdf.umd.min.js',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Everything is same-origin now: cache-first, fall back to network, then cached index.
  if (url.origin === self.location.origin) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res;
    }).catch(() => caches.match('./index.html'))));
  }
});
