// public/sw.js
const CACHE = 'silence-offline-cache-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;

      return fetch(e.request).then(res => {
        if (!res || res.status !== 200 || res.type !== 'basic') return res;
        caches.open(CACHE).then(cache => cache.put(e.request, res.clone()));
        return res;
      }).catch(() => console.log('完全离线，且未缓存该资源:', e.request.url));
    })
  );
});