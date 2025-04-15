self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("canteen-cache").then((cache) => {
      return cache.addAll([
        "/",
        "/index.html",
        "/vite.svg",
        "/manifest.json"
      ]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
