// service-worker-clean.js — PWA с кешированием без логов

const CACHE_NAME = "digitalyty-cache-v1";
const urlsToCache = [
    "/",
    "/index.html",
    "/style.css",
    "/js/nav.js",
    "/js/form.js",
    "/js/accessibility.js",
    "/js/scrollTop.js",
    "/js/service-worker-register.js",
    "/images/icon-192.png",
    "/images/icon-512.png",
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((names) =>
                Promise.all(
                    names
                        .filter((n) => n !== CACHE_NAME)
                        .map((n) => caches.delete(n))
                )
            )
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches
            .match(event.request)
            .then((response) => response || fetch(event.request))
    );
});
