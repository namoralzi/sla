const CACHE = 'lista-pwa-v1';
const ASSETS = [
  './',
  './index.html',
  './app.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (e)=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e)=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>{ if(k!==CACHE) return caches.delete(k); }))));
  self.clients.claim();
});

self.addEventListener('fetch', (e)=>{
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
