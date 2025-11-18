const CACHE_NAME = 'absensi-qr-v1';
const RUNTIME_CACHE = 'absensi-qr-runtime-v1';
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
        // Continue even if some assets fail to cache
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

// Fetch event - Network first for API, Cache first for static assets
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
    // If response is not ok, try cache
    const cached = await caches.match(request);
    return cached || response;
  } catch (error) {
    console.log('[Service Worker] Fetch failed; returning offline page:', error);
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
    console.log('[Service Worker] HTML fetch failed; returning offline page:', error);
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
    console.log('[Service Worker] Cache miss for:', request.url);
    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/plain'
      })
    });
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
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .container {
          background: white;
          border-radius: 12px;
          padding: 40px 20px;
          max-width: 500px;
          text-align: center;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        }
        .icon {
          font-size: 64px;
          margin-bottom: 20px;
        }
        h1 {
          font-size: 28px;
          color: #333;
          margin-bottom: 10px;
        }
        p {
          color: #666;
          line-height: 1.6;
          margin-bottom: 30px;
          font-size: 16px;
        }
        .button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .button:hover {
          transform: translateY(-2px);
        }
        .button:active {
          transform: translateY(0);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">📡</div>
        <h1>Anda Sedang Offline</h1>
        <p>Koneksi internet Anda terputus. Beberapa fitur mungkin tidak tersedia. Silakan periksa koneksi Anda dan coba lagi.</p>
        <button class="button" onclick="location.reload()">Coba Lagi</button>
      </div>
    </body>
    </html>`,
    {
      headers: {
        'Content-Type': 'text/html; charset=utf-8'
      }
    }
  );
}

// Handle messages from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(RUNTIME_CACHE);
  }
});
