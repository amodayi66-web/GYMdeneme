// Service Worker for Gym Planner PWA
const CACHE = 'gym-planner-v1';
const URLS = [
  '/GYMdeneme/',
  '/GYMdeneme/index.html',
  '/GYMdeneme/app.js',
  '/GYMdeneme/style.css',
  '/GYMdeneme/exercises.js',
  '/GYMdeneme/timers.js',
  '/GYMdeneme/sync.js',
  '/GYMdeneme/analytics.js',
  '/GYMdeneme/plans.js',
  '/GYMdeneme/firebase-config.js',
  '/GYMdeneme/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // For GIFs from GitHub, don't cache them (they're large and change)
  if (e.request.url.includes('raw.githubusercontent.com')) {
    e.respondWith(fetch(e.request));
    return;
  }
  // For everything else, network-first with cache fallback
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});