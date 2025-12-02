// PWA Configuration Tips & Advanced Features
// This file contains optional configurations for future enhancements

// OPTIONAL: If using Workbox in the future
// npm install workbox-build -D

// Example workbox configuration (for reference):
/*
const workboxBuild = require('workbox-build');
const path = require('path');

const buildSW = () => {
  return workboxBuild.injectManifest({
    swSrc: 'public/service-worker.js',
    swDest: 'public/service-worker.js',
    globDirectory: 'public',
    globPatterns: [
      '**\/*.{js,css,html,png,svg,jpg,jpeg,gif,webp,woff,woff2}',
    ],
    globIgnores: [
      'service-worker.js',
      'offline.html',
    ],
    maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
  });
};

buildSW().then(() => {
  console.log('Service Worker generated');
});
*/

// ADVANCED FEATURES TO CONSIDER:

// 1. PUSH NOTIFICATIONS
/*
// Request user permission
function requestNotificationPermission() {
  if ('Notification' in window) {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        console.log('Notification permission granted');
      }
    });
  }
}

// Send notification from SW
self.registration.showNotification('Attendance Reminder', {
  body: 'Don\'t forget to mark your attendance today!',
  icon: '/icons/icon-192x192.svg',
  badge: '/icons/icon-192x192-maskable.svg',
  tag: 'attendance-reminder',
  requireInteraction: true,
});
*/

// 2. BACKGROUND SYNC
/*
// Register background sync
async function registerBackgroundSync() {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    const registration = await navigator.serviceWorker.ready;
    try {
      await registration.sync.register('attendance-sync');
      console.log('Background sync registered');
    } catch (error) {
      console.log('Background sync failed:', error);
    }
  }
}

// In service worker
self.addEventListener('sync', (event) => {
  if (event.tag === 'attendance-sync') {
    event.waitUntil(syncAttendance());
  }
});

async function syncAttendance() {
  const requests = await db.pendingRequests.getAll();
  for (const request of requests) {
    try {
      const response = await fetch(request.url, {
        method: request.method,
        body: request.body,
        headers: request.headers,
      });
      if (response.ok) {
        await db.pendingRequests.delete(request.id);
      }
    } catch (error) {
      console.log('Sync failed:', error);
    }
  }
}
*/

// 3. PERIODIC BACKGROUND SYNC
/*
// Register periodic sync (requires user permission)
async function registerPeriodicSync() {
  if ('serviceWorker' in navigator && 'PeriodicSyncManager' in window) {
    const registration = await navigator.serviceWorker.ready;
    try {
      await registration.periodicSync.register('check-attendance', {
        minInterval: 24 * 60 * 60 * 1000, // 24 hours
      });
      console.log('Periodic sync registered');
    } catch (error) {
      console.log('Periodic sync failed:', error);
    }
  }
}

// In service worker
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-attendance') {
    event.waitUntil(checkAttendanceStatus());
  }
});
*/

// 4. INSTALL PROMPT
/*
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  // Show your custom install button
  showInstallPrompt();
});

function showInstallPrompt() {
  const button = document.getElementById('install-button');
  button.style.display = 'block';
  button.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response: ${outcome}`);
    deferredPrompt = null;
  });
}

window.addEventListener('appinstalled', () => {
  console.log('PWA was installed');
  deferredPrompt = null;
});
*/

// 5. NETWORK INFORMATION API
/*
function monitorNetworkQuality() {
  if ('connection' in navigator) {
    const connection = navigator.connection;
    
    console.log(`Effective type: ${connection.effectiveType}`);
    console.log(`Downlink: ${connection.downlink} Mbps`);
    console.log(`Rtt: ${connection.rtt} ms`);
    
    connection.addEventListener('change', () => {
      console.log(`Connection changed: ${connection.effectiveType}`);
      // Adjust app behavior based on connection quality
      if (connection.effectiveType === '4g') {
        // Load high quality images
      } else if (connection.effectiveType === '3g') {
        // Load medium quality images
      } else {
        // Load low quality images
      }
    });
  }
}
*/

// 6. PAYMENT REQUEST API
/*
// For future attendance payment or subscription features
const paymentDetails = {
  total: {
    label: 'Total',
    amount: { currency: 'IDR', value: '10000' }
  },
  displayItems: [
    {
      label: 'Monthly Subscription',
      amount: { currency: 'IDR', value: '10000' }
    }
  ]
};

const paymentOptions = {
  requestPayerName: true,
  requestPayerEmail: true,
  requestPayerPhone: true,
};

if (window.PaymentRequest) {
  const request = new PaymentRequest(
    [{ supportedMethods: 'basic-card' }],
    paymentDetails,
    paymentOptions
  );
  
  request.canMakePayment().then((canMakePayment) => {
    if (canMakePayment) {
      console.log('Payment available');
    }
  });
}
*/

// 7. GEOLOCATION API
/*
// For location-based attendance
function getLocationForAttendance() {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log(`Location: ${latitude}, ${longitude}`);
        // Send with attendance record
        submitAttendanceWithLocation(latitude, longitude);
      },
      (error) => {
        console.log('Location error:', error);
      },
      { timeout: 10000 }
    );
  }
}
*/

// 8. STORAGE & QUOTA MANAGEMENT
/*
async function checkStorageQuota() {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    const percentUsed = (estimate.usage / estimate.quota) * 100;
    console.log(`Storage: ${percentUsed.toFixed(2)}% used`);
    
    if (percentUsed > 80) {
      console.log('Storage usage is high');
      // Clear old caches
      const cacheNames = await caches.keys();
      for (const name of cacheNames) {
        if (name !== 'current-cache') {
          await caches.delete(name);
        }
      }
    }
  }
}

// Request persistent storage
async function requestPersistentStorage() {
  if ('storage' in navigator && 'persist' in navigator.storage) {
    const persistent = await navigator.storage.persist();
    console.log(`Persistent storage: ${persistent ? 'granted' : 'denied'}`);
  }
}
*/

// 9. SHARED STORAGE (Experimental)
/*
// Share data between tabs/windows
const sharedData = {
  userId: 'user123',
  lastAttendance: new Date(),
};

// Send data
window.addEventListener('focus', () => {
  const channel = new BroadcastChannel('attendance-channel');
  channel.postMessage(sharedData);
});

// Receive data
const channel = new BroadcastChannel('attendance-channel');
channel.onmessage = (event) => {
  console.log('Shared data:', event.data);
};
*/

// 10. DEBUGGING SERVICE WORKER
/*
// Add detailed logging to service worker
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Log all requests
  console.log('[Service Worker] Fetch:', {
    url: request.url,
    method: request.method,
    mode: request.mode,
    timestamp: new Date().toISOString(),
  });
  
  // Add timing information
  const startTime = performance.now();
  event.respondWith(
    fetch(request).then((response) => {
      const duration = performance.now() - startTime;
      console.log('[Service Worker] Fetch completed:', {
        url: request.url,
        status: response.status,
        duration: `${duration.toFixed(2)}ms`,
      });
      return response;
    }).catch((error) => {
      console.log('[Service Worker] Fetch failed:', {
        url: request.url,
        error: error.message,
      });
      // Return offline page
      return caches.match('/offline.html');
    })
  );
});
*/

module.exports = {
  // Placeholder for future PWA configurations
};
