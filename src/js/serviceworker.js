const CACHE_NAME = "weather-dashboard-v1";
const URLsToCache = [
  "/",
  "/index.html",
  "/src/style.css",
  "/src/js/main.js",
  "/src/js/dashboard.js",
  "/src/js/api.js",
  "/src/js/ui.js",
  "/src/js/utils.js",
  "/src/js/serviceworker.js",
];

self.addEventListener("install", (e) =>
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLsToCache))
  )
);

self.addEventListener("fetch", (e) => {
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});
