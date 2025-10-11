/* ===================== service-worker.js ===================== */
/* Place this file at /service-worker.js in your repo */

// NOTE: copy this file as-is into your repository root parallel to index.html

/*
self.addEventListener('install', ...)
Caches index.html, manifest.json, and any assets so the app works offline after first load.
*/

// service-worker.js

/*
const CACHE_NAME = 'pwa-voicechanger-v1';
const OFFLINE_URLS = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(OFFLINE_URLS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(resp => {
      // Cache fetched responses for future offline use
      if (event.request.url.startsWith(self.location.origin)){
        const copy = resp.clone();
        caches.open(CACHE_NAME).then(c=>c.put(event.request, copy));
      }
      return resp;
    }).catch(()=>caches.match('/index.html'))
  ));
});*/
const CACHE_NAME = "voicechanger-v1";
const urlsToCache = [
  "./index.html",
  "./manifest.json"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  );
});

