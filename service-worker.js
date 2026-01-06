// service-worker.js
const CACHE_NAME = "digitalyty-cache-v3";

const PRECACHE_URLS = [
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
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            await cache.addAll(PRECACHE_URLS);
            self.skipWaiting(); // сразу активируем новую версию
        })()
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        (async () => {
            const names = await caches.keys();
            await Promise.all(
                names.map((n) => (n !== CACHE_NAME ? caches.delete(n) : null))
            );
            clients.claim(); // управляем открытыми вкладками сразу
        })()
    );
});

self.addEventListener("fetch", (event) => {
    const { request } = event;

    // Кэшируем только GET и только тот же origin
    if (
        request.method !== "GET" ||
        new URL(request.url).origin !== self.location.origin
    ) {
        return; // пропускаем: пойдёт обычный fetch
    }

    event.respondWith(
        (async () => {
            try {
                const networkResponse = await fetch(request, {
                    cache: "no-store",
                }); // всегда свежак
                // Кладём в кэш только успешные ответы
                if (networkResponse && networkResponse.ok) {
                    const cache = await caches.open(CACHE_NAME);
                    cache.put(request, networkResponse.clone());
                }
                return networkResponse;
            } catch (err) {
                // Фоллбек из кэша при офлайне/ошибке
                const cached = await caches.match(request);
                if (cached) return cached;

                // Можно добавить офлайн-страницу:
                // return caches.match('/offline.html');
                throw err;
            }
        })()
    );
});
