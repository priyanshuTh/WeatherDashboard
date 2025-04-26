const CACHE_NAME = "weather-dashboard-v3";
const URLsToCache = [
  "/",
  "/index.html",
  "/src/js/main.js",
  "/src/js/dashboard.js",
  "/src/js/api.js",
  "/src/js/ui.js",
  "/src/js/utils.js",
  "/src/css/style.css",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// Install event - cache assets
self.addEventListener("install", (e) => {
  console.log("[ServiceWorker] Install");
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[ServiceWorker] Caching app shell");
      return cache.addAll(URLsToCache);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (e) => {
  console.log("[ServiceWorker] Activate");
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[ServiceWorker] Removing old cache", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  // Ensure the service worker takes control immediately
  return self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener("fetch", (e) => {
  console.log("[ServiceWorker] Fetch", e.request.url);

  // Skip non-GET requests
  if (e.request.method !== "GET") return;

  // Skip cross-origin requests
  const url = new URL(e.request.url);
  if (
    url.origin !== location.origin &&
    !e.request.url.includes("openweathermap.org") &&
    !e.request.url.includes("unpkg.com") &&
    !e.request.url.includes("cdn") &&
    !e.request.url.includes("fonts.googleapis.com") &&
    !e.request.url.includes("fonts.gstatic.com") &&
    !e.request.url.includes("flagcdn.com")
  ) {
    return;
  }

  // Cache-first strategy for app shell
  if (
    URLsToCache.includes(url.pathname) ||
    url.pathname.startsWith("/src/") ||
    url.pathname.startsWith("/icons/")
  ) {
    e.respondWith(
      caches.match(e.request).then((response) => {
        return (
          response ||
          fetch(e.request).then((fetchResponse) => {
            return caches.open(CACHE_NAME).then((cache) => {
              // Don't cache errors
              if (fetchResponse.status === 200) {
                cache.put(e.request, fetchResponse.clone());
              }
              return fetchResponse;
            });
          })
        );
      })
    );
    return;
  }

  // Network-first strategy for API requests
  if (e.request.url.includes("openweathermap.org")) {
    e.respondWith(
      fetch(e.request)
        .then((response) => {
          // Don't cache errors
          if (!response || response.status !== 200) {
            return response;
          }

          // Clone the response to cache it and return it
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // If network fails, try from cache
          return caches.match(e.request);
        })
    );
    return;
  }

  // Default: try network, fall back to cache
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Cache successful responses
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Fall back to cache if network fails
        return caches.match(e.request);
      })
  );
});
