const CACHE_NAME = "virat7-cache-v1";

const urlsToCache = [
  "./",
  "./index.html",
  "./login.html",
  "./dashboard.html"
];


self.addEventListener("install", e => {

  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );

});


self.addEventListener("fetch", e => {

  e.respondWith(
    fetch(e.request).catch(() =>
      caches.match(e.request)
    )
  );

});