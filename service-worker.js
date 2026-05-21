const CACHE_NAME = "treino-app-v3";

const APP_SHELL = [
  "/apptreino/",
  "/apptreino/index.html",
  "/apptreino/manifest.json",
  "/apptreino/icon-192.png",
  "/apptreino/icon-512.png"
];

self.addEventListener("install", event => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;

  if(request.method !== "GET") return;

  const url = new URL(request.url);

  // A planilha/Apps Script sempre busca na internet para pegar dados novos.
  if(url.hostname.includes("script.googleusercontent.com") || url.hostname.includes("script.google.com")){
    event.respondWith(fetch(request, { cache: "no-store" }));
    return;
  }

  // Arquivos do app abrem rápido pelo cache e atualizam em segundo plano.
  if(url.origin === self.location.origin && url.pathname.startsWith("/apptreino/")){
    event.respondWith(
      caches.match(request).then(cached => {
        const networkFetch = fetch(request).then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          return response;
        }).catch(() => cached);

        return cached || networkFetch;
      })
    );
    return;
  }

  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
