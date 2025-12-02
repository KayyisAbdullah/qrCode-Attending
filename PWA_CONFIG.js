/**
 * PWA Configuration & Optimization
 * File konfigurasi untuk meningkatkan PWA performance
 */

/**
 * 1. CACHING STRATEGIES
 * Define custom caching strategies untuk different resource types
 */

// Contoh untuk custom caching di Service Worker
const CACHE_STRATEGIES = {
  // API calls - Network First
  api: {
    networkTimeoutSeconds: 5,
    fallbackResponse: {
      status: 503,
      body: 'Service Unavailable'
    },
    cacheDuration: '24h'
  },
  
  // HTML pages - Stale While Revalidate
  pages: {
    cacheDuration: '1d',
    maxAge: '7d'
  },
  
  // Images - Cache First
  images: {
    cacheDuration: '30d',
    maxSize: '10MB'
  },
  
  // CSS/JS - Cache First with long expiry
  assets: {
    cacheDuration: '90d',
    versioning: true
  }
};

/**
 * 2. NOTIFICATION CONFIG
 * Push notification configuration
 */

const NOTIFICATION_CONFIG = {
  badge: '/icons/icon-72x72.png',
  icon: '/icons/icon-192x192.png',
  requireInteraction: false,
  vibrate: [200, 100, 200],
  tag: 'absensi-qr-notification',
  
  // Actions untuk notification
  actions: [
    {
      action: 'open',
      title: 'Buka Aplikasi',
      icon: '/icons/icon-192x192.png'
    },
    {
      action: 'dismiss',
      title: 'Tutup',
      icon: '/icons/icon-192x192.png'
    }
  ]
};

/**
 * 3. BACKGROUND SYNC CONFIG
 * Background synchronization untuk pending actions
 */

const BACKGROUND_SYNC_CONFIG = {
  tags: {
    attendance: {
      minInterval: 300000, // 5 minutes
      maxRetries: 3
    },
    students: {
      minInterval: 600000, // 10 minutes
      maxRetries: 2
    },
    reports: {
      minInterval: 3600000, // 1 hour
      maxRetries: 1
    }
  }
};

/**
 * 4. OFFLINE STORAGE CONFIG
 * Configuration untuk offline data storage
 */

const OFFLINE_STORAGE_CONFIG = {
  // IndexedDB database config
  databases: {
    attendance: {
      version: 1,
      stores: {
        records: {
          keyPath: 'id',
          indexes: {
            studentId: 'studentId',
            date: 'date',
            synced: 'synced'
          }
        }
      }
    },
    students: {
      version: 1,
      stores: {
        list: {
          keyPath: 'id',
          indexes: {
            class: 'class',
            name: 'name'
          }
        }
      }
    }
  },
  
  // LocalStorage config
  localStorage: {
    tokenExpiry: 86400000, // 24 hours
    maxSize: '5MB'
  },
  
  // Cache Storage config
  cacheStorage: {
    maxSize: '50MB',
    cleanupInterval: 604800000 // 7 days
  }
};

/**
 * 5. PERFORMANCE OPTIMIZATION
 * Performance tuning options
 */

const PERFORMANCE_CONFIG = {
  // Code splitting
  codeSplit: {
    enabled: true,
    chunks: ['dashboard', 'scanner', 'reports']
  },
  
  // Image optimization
  images: {
    optimization: true,
    formats: ['webp', 'jpg'],
    sizes: [192, 384, 512]
  },
  
  // Critical resources preload
  preload: [
    '/fonts/geist.woff2',
    '/icons/icon-192x192.png',
    '/manifest.json'
  ],
  
  // Resource hints
  hints: {
    preconnect: ['https://fonts.googleapis.com'],
    prefetch: ['/api/students', '/api/attendance']
  },
  
  // Network throttling for dev
  simulateSlowNetwork: {
    enabled: false, // Enable for testing
    rtt: 400, // Round trip time in ms
    downloadThroughput: 400000, // bits/second
    uploadThroughput: 200000
  }
};

/**
 * 6. SECURITY CONFIG
 * Security settings untuk PWA
 */

const SECURITY_CONFIG = {
  // Content Security Policy
  csp: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'https:'],
    'font-src': ["'self'"],
    'connect-src': ["'self'", 'https:']
  },
  
  // CORS settings
  cors: {
    origin: 'https://yourdomain.com',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  },
  
  // Permissions Policy
  permissionsPolicy: {
    'geolocation': [],
    'microphone': [],
    'camera': [],
    'payment': []
  }
};

/**
 * 7. MONITORING & ANALYTICS
 * Configuration untuk monitoring dan analytics
 */

const MONITORING_CONFIG = {
  // Web Vitals tracking
  webVitals: {
    enabled: true,
    reportEndpoint: '/api/metrics',
    sampleRate: 0.1 // 10% sampling
  },
  
  // Error tracking
  errors: {
    enabled: true,
    reportEndpoint: '/api/errors',
    includeStackTrace: true
  },
  
  // Performance metrics
  performance: {
    enabled: true,
    metrics: [
      'navigationTiming',
      'resourceTiming',
      'paintTiming',
      'layoutShift'
    ]
  },
  
  // User analytics
  analytics: {
    enabled: true,
    events: [
      'page_view',
      'app_installed',
      'offline_mode',
      'sync_failed'
    ]
  }
};

/**
 * 8. FEATURE FLAGS
 * Feature toggles untuk PWA functionality
 */

const FEATURE_FLAGS = {
  offline_support: true,
  push_notifications: true,
  background_sync: true,
  periodic_sync: false, // Require browser support
  share_target: true,
  shortcuts: true,
  app_shortcuts: true,
  file_handling: false // Future
};

/**
 * 9. DEPLOYMENT CONFIG
 * Environment-specific configurations
 */

const DEPLOYMENT_CONFIG = {
  development: {
    serviceWorkerScope: '/',
    cacheVersion: 'dev-' + Date.now(),
    debugLogging: true
  },
  
  staging: {
    serviceWorkerScope: '/',
    cacheVersion: 'staging-1.0.0',
    debugLogging: true
  },
  
  production: {
    serviceWorkerScope: '/',
    cacheVersion: 'v1.0.0',
    debugLogging: false,
    enableAnalytics: true,
    enableErrorReporting: true
  }
};

/**
 * 10. MANIFEST GENERATION
 * Utility untuk generate manifest.json
 */

function generateManifest(config = {}) {
  return {
    name: config.name || 'Sistem Absensi QR Code',
    short_name: config.shortName || 'AbsensiQR',
    description: config.description || 'Sistem absensi modern dengan QR Code',
    start_url: config.startUrl || '/',
    scope: config.scope || '/',
    display: config.display || 'standalone',
    orientation: config.orientation || 'portrait-primary',
    background_color: config.backgroundColor || '#ffffff',
    theme_color: config.themeColor || '#2563eb',
    
    icons: config.icons || [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-192x192-maskable.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      }
    ],
    
    screenshots: config.screenshots || [
      {
        src: '/screenshots/screenshot-540x720.png',
        sizes: '540x720',
        type: 'image/png',
        form_factor: 'narrow'
      }
    ],
    
    categories: config.categories || ['education', 'productivity'],
    
    shortcuts: config.shortcuts || [
      {
        name: 'Login Admin',
        short_name: 'Admin',
        description: 'Login sebagai Administrator',
        url: '/login/admin',
        icons: [{
          src: '/icons/admin-shortcut-192x192.png',
          sizes: '192x192'
        }]
      },
      {
        name: 'Login Siswa',
        short_name: 'Siswa',
        description: 'Login sebagai Siswa',
        url: '/login/student',
        icons: [{
          src: '/icons/student-shortcut-192x192.png',
          sizes: '192x192'
        }]
      },
      {
        name: 'Scan QR Code',
        short_name: 'Scan',
        description: 'Scan QR Code untuk Absensi',
        url: '/scan-qr',
        icons: [{
          src: '/icons/scan-shortcut-192x192.png',
          sizes: '192x192'
        }]
      }
    ]
  };
}

/**
 * 11. SERVICE WORKER INSTALLATION
 * Helper untuk install dan update service worker
 */

async function registerServiceWorker(config = {}) {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers tidak didukung');
    return null;
  }

  try {
    const scope = config.scope || '/';
    const scriptUrl = config.scriptUrl || '/service-worker.js';
    
    const registration = await navigator.serviceWorker.register(scriptUrl, {
      scope: scope,
      updateViaCache: 'none' // Always check for updates
    });

    console.log('Service Worker registered:', registration);

    // Check for updates periodically
    const updateInterval = config.updateInterval || 3600000; // 1 hour
    setInterval(() => {
      registration.update();
    }, updateInterval);

    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

/**
 * 12. PWA INITIALIZATION
 * Main initialization function
 */

async function initializePWA(config = {}) {
  console.log('[PWA] Initializing...');

  // Register service worker
  await registerServiceWorker(config);

  // Request notification permission
  if (config.enableNotifications && 'Notification' in window) {
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }

  // Request background sync permission
  if (config.enableBackgroundSync && 'serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      if ('periodicSync' in registration) {
        await registration.periodicSync.register('check-updates', {
          minInterval: 24 * 60 * 60 * 1000
        });
      }
    } catch (error) {
      console.log('Background sync not available:', error);
    }
  }

  console.log('[PWA] Initialization complete');
}

// Export configurations
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CACHE_STRATEGIES,
    NOTIFICATION_CONFIG,
    BACKGROUND_SYNC_CONFIG,
    OFFLINE_STORAGE_CONFIG,
    PERFORMANCE_CONFIG,
    SECURITY_CONFIG,
    MONITORING_CONFIG,
    FEATURE_FLAGS,
    DEPLOYMENT_CONFIG,
    generateManifest,
    registerServiceWorker,
    initializePWA
  };
}
