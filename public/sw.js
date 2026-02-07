/**
 * ECHOES Service Worker
 * Feature 14: PWA Support - Offline viewing of past sessions
 */

const STATIC_CACHE = 'echoes-static-v1';
const DYNAMIC_CACHE = 'echoes-dynamic-v1';

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  // Fonts will be cached on first load
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - Network first, falling back to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip API requests (they should be fresh)
  if (url.pathname.includes('/api/') || url.hostname.includes('generativelanguage.googleapis.com')) {
    return;
  }

  // For fonts and static assets - Cache First
  if (
    url.pathname.includes('/fonts/') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.woff') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;

        return fetch(request).then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // For HTML/JS/CSS - Network First with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cached) => {
          if (cached) return cached;

          // Return offline page for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/');
          }

          return new Response('Offline', { status: 503 });
        });
      })
  );
});

// Handle background sync for offline submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-sessions') {
    event.waitUntil(syncOfflineSessions());
  }
});

// Push notification handler
self.addEventListener('push', (event) => {
  if (event.data) {
    let data;
    try {
      data = event.data.json();
    } catch {
      data = { title: 'ECHOES', body: event.data.text() };
    }

    // Validate URL — only allow same-origin or root paths
    let notificationUrl = '/';
    if (data.url) {
      try {
        const parsed = new URL(data.url, self.location.origin);
        if (parsed.origin === self.location.origin) {
          notificationUrl = parsed.pathname;
        }
      } catch {
        notificationUrl = '/';
      }
    }

    const options = {
      body: data.body || 'Time for your emotional check-in',
      icon: '/icons/icon.svg',
      vibrate: [100, 50, 100],
      data: {
        url: notificationUrl
      },
      actions: [
        { action: 'open', title: 'Start Session' },
        { action: 'dismiss', title: 'Later' }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'ECHOES', options)
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});

// Sync offline sessions when back online
async function syncOfflineSessions() {
  // This would sync any pending sessions stored in IndexedDB
  console.log('[SW] Syncing offline sessions...');
}
