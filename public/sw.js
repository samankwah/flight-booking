// Service Worker for Flight Booking App
const CACHE_NAME = 'flight-booking-v1';
const RUNTIME_CACHE = 'runtime-cache-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );

  self.skipWaiting();
});

// Activate event - clean up old caches
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

// Fetch event - network first, then cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip chrome-extension and other non-http(s) requests
  if (!request.url.startsWith('http')) {
    return;
  }

  // API requests - network first, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Static assets - cache first, fallback to network
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image'
  ) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // HTML pages - network first with cache fallback
  if (request.destination === 'document') {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Everything else - network first
  event.respondWith(networkFirstStrategy(request));
});

/**
 * Network First Strategy
 * Try network first, fallback to cache if offline
 */
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Network failed, trying cache:', request.url);

    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // If both network and cache fail, return offline page for navigations
    if (request.destination === 'document') {
      return caches.match('/offline.html');
    }

    // Return a basic error response
    return new Response('Network error', {
      status: 408,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

/**
 * Cache First Strategy
 * Try cache first, fallback to network
 */
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Cache and network both failed:', request.url);
    return new Response('Resource not available', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync triggered:', event.tag);

  if (event.tag === 'sync-bookings') {
    event.waitUntil(syncPendingItems('booking'));
  } else if (event.tag === 'sync-all') {
    event.waitUntil(syncPendingItems());
  }
});

/**
 * Sync pending items from IndexedDB
 */
async function syncPendingItems(filterType = null) {
  try {
    console.log('[Service Worker] Syncing pending items...');

    // Open IndexedDB
    const db = await openIndexedDB();
    const transaction = db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    const index = store.index('status');
    const request = index.getAll('pending');

    return new Promise((resolve, reject) => {
      request.onsuccess = async () => {
        let items = request.result || [];

        // Filter by type if specified
        if (filterType) {
          items = items.filter(item => item.type === filterType);
        }

        if (items.length === 0) {
          console.log('[Service Worker] No pending items to sync');
          resolve();
          return;
        }

        console.log(`[Service Worker] Found ${items.length} pending items`);

        let successCount = 0;
        let failCount = 0;

        // Sync each item
        for (const item of items) {
          try {
            const result = await syncSingleItem(item, db);
            if (result.success) {
              successCount++;
            } else {
              failCount++;
            }
          } catch (error) {
            console.error('[Service Worker] Error syncing item:', error);
            failCount++;
          }
        }

        console.log(`[Service Worker] Sync complete: ${successCount} success, ${failCount} failed`);

        // Notify clients about sync completion
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'SYNC_COMPLETE',
            data: { successCount, failCount, total: items.length }
          });
        });

        resolve();
      };

      request.onerror = () => {
        console.error('[Service Worker] Error fetching pending items:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('[Service Worker] Error in syncPendingItems:', error);
  }
}

/**
 * Sync a single item
 */
async function syncSingleItem(item, db) {
  try {
    // Get auth token from IndexedDB
    const token = await getAuthToken(db);
    if (!token) {
      console.warn('[Service Worker] No auth token found');
      return { success: false, error: 'Not authenticated' };
    }

    // Determine API endpoint and method
    let url, method, body;

    switch (item.type) {
      case 'booking':
        url = `${self.location.origin}/api/bookings`;
        method = 'POST';
        body = JSON.stringify(item.data);
        break;

      case 'price-alert':
        if (item.action === 'create') {
          url = `${self.location.origin}/api/price-alerts`;
          method = 'POST';
        } else if (item.action === 'update') {
          url = `${self.location.origin}/api/price-alerts/${item.data.id}`;
          method = 'PUT';
        } else if (item.action === 'delete') {
          url = `${self.location.origin}/api/price-alerts/${item.data.id}`;
          method = 'DELETE';
        }
        body = item.action !== 'delete' ? JSON.stringify(item.data) : undefined;
        break;

      case 'preference':
        url = `${self.location.origin}/api/notifications/preferences`;
        method = 'PUT';
        body = JSON.stringify(item.data);
        break;

      default:
        console.warn('[Service Worker] Unknown sync item type:', item.type);
        return { success: false, error: 'Unknown type' };
    }

    // Make API request
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Update item status to completed
    const transaction = db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    await store.put({
      ...item,
      status: 'completed',
      completedAt: Date.now(),
    });

    console.log('[Service Worker] Item synced successfully:', item.id);
    return { success: true };

  } catch (error) {
    console.error('[Service Worker] Error syncing item:', error);

    // Update retry count
    const retryCount = (item.retryCount || 0) + 1;
    const maxRetries = 3;

    const transaction = db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');

    if (retryCount >= maxRetries) {
      await store.put({
        ...item,
        status: 'failed',
        retryCount,
        lastError: error.message,
      });
      console.error('[Service Worker] Max retries reached for item:', item.id);
    } else {
      await store.put({
        ...item,
        status: 'pending',
        retryCount,
        lastError: error.message,
      });
    }

    return { success: false, error: error.message };
  }
}

/**
 * Open IndexedDB
 */
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('FlightBookingDB', 1);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create stores if they don't exist
      if (!db.objectStoreNames.contains('syncQueue')) {
        const store = db.createObjectStore('syncQueue', { keyPath: 'id' });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('type', 'type', { unique: false });
      }

      if (!db.objectStoreNames.contains('userPreferences')) {
        db.createObjectStore('userPreferences', { keyPath: 'key' });
      }
    };
  });
}

/**
 * Get auth token from IndexedDB
 */
async function getAuthToken(db) {
  try {
    const transaction = db.transaction(['userPreferences'], 'readonly');
    const store = transaction.objectStore('userPreferences');
    const request = store.get('authToken');

    return new Promise((resolve) => {
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.value : null);
      };
      request.onerror = () => resolve(null);
    });
  } catch (error) {
    console.error('[Service Worker] Error getting auth token:', error);
    return null;
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received');

  const data = event.data ? event.data.json() : {};

  const options = {
    body: data.body || 'New notification from Flight Booking',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: data.url || '/',
    actions: [
      {
        action: 'open',
        title: 'Open App',
      },
      {
        action: 'close',
        title: 'Close',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Flight Booking', options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    const urlToOpen = event.notification.data || '/';

    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // If a Window tab matching the url already exists, focus that;
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }

        // Otherwise, open a new tab
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  }
});

// Message handling (for manual cache clearing, etc.)
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);

  if (event.data.action === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.action === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(cacheNames.map((name) => caches.delete(name)));
      })
    );
  }
});
