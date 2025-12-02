const CACHE_NAME = 'absensi-qr-v13-stable';
const RUNTIME_CACHE = 'absensi-qr-runtime-v13-stable';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch((error) => {
        console.log('[Service Worker] Cache addAll error:', error);
        return Promise.resolve();
      });
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // API requests - Network first, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Static assets - Cache first, fallback to network
  if (
    request.method === 'GET' &&
    (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot)$/i) ||
      url.pathname.startsWith('/_next/'))
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // HTML pages - Network first, fallback to cache
  if (request.method === 'GET') {
    event.respondWith(networkFirstHtml(request));
    return;
  }

  // Other requests - pass through
  event.respondWith(fetch(request));
});

// Network first strategy for API calls
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
      return response;
    }
    const cached = await caches.match(request);
    return cached || response;
  } catch (error) {
    const cached = await caches.match(request);
    return cached || getOfflinePage();
  }
}

// Network first for HTML pages
async function networkFirstHtml(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
      return response;
    }
    const cached = await caches.match(request);
    return cached || response;
  } catch (error) {
    const cached = await caches.match(request);
    return cached || getOfflinePage();
  }
}

// Cache first strategy for static assets
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
      return response;
    }
    return response;
  } catch (error) {
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Offline page
function getOfflinePage() {
  return new Response(
    `<!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Offline</title>
      <style>
        body { font-family: sans-serif; text-align: center; padding: 50px; }
        h1 { color: #333; }
        p { color: #666; }
        button { padding: 10px 20px; background: #0070f3; color: white; border: none; border-radius: 5px; cursor: pointer; }
      </style>
    </head>
    <body>
      <h1>Anda Sedang Offline</h1>
      <p>Koneksi internet Anda terputus.</p>
      <button onclick="location.reload()">Coba Lagi</button>
    </body>
    </html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}
