// Service worker: κρατά όλα τα αρχεία του παιχνιδιού για να παίζεται offline.
const VERSION = 'geomichani-v5';
const FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/style.css',
  './js/main.js',
  './js/game.js',
  './js/ui.js',
  './js/render.js',
  './js/physics.js',
  './js/track.js',
  './js/levels.js',
  './js/progress.js',
  './js/audio.js',
  './js/map-layout.js',
  './js/data/countries.js',
  './js/data/helpers.js',
  './js/data/regions.js',
  './js/data/central.js',
  './js/data/central2.js',
  './js/data/west.js',
  './js/data/west2.js',
  './js/data/north.js',
  './js/data/east.js',
  './js/data/islands.js',
  './icons/icon.svg',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Δίκτυο πρώτα (για να παίρνουμε ενημερώσεις), αλλιώς από την cache.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true })),
  );
});
