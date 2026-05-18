const CACHE_NAME = "treino-app-v1";

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        "/apptreino/",
        "/apptreino/index.html",
        "/apptreino/manifest.json",
        "/apptreino/icon-192.png",
        "/apptreino/icon-512.png"
      ]);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});