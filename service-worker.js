// service-worker.js
// Toggle: set DEV_NO_CACHE=true for development builds
// Для разработки держите const DEV_NO_CACHE = true;
// Для продакшена поставьте false;

const DEV_NO_CACHE = true;

const CACHE_NAME = "digitalyty-cache-v4";

const PRECACHE_URLS = [
    "/",
    "/index.html",
    "/style.css",
    "/manifest.webmanifest",
    "/js/nav.js",
    "/js/form.js",
    "/js/scrollTop.js",
    "/js/service-worker-register.js",
    "/images/icon-192.png",
    "/images/icon-512.png",
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        (async () => {
            // DEV: do not precache anything
            if (DEV_NO_CACHE) {
                self.skipWaiting();
                return;
            }

            const cache = await caches.open(CACHE_NAME);
            await cache.addAll(PRECACHE_URLS);
            self.skipWaiting(); // activate immediately
        })()
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        (async () => {
            // DEV: delete ALL caches to guarantee a clean state
            if (DEV_NO_CACHE) {
                const names = await caches.keys();
                await Promise.all(names.map((n) => caches.delete(n)));
                await clients.claim();
                return;
            }

            // PROD: delete old caches only
            const names = await caches.keys();
            await Promise.all(
                names.map((n) => (n !== CACHE_NAME ? caches.delete(n) : null))
            );
            await clients.claim();
        })()
    );
});

self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Only same-origin GET requests are handled by SW.
    if (request.method !== "GET" || url.origin !== self.location.origin) return;

    // DEV: network-only for everything
    if (DEV_NO_CACHE) {
        event.respondWith(fetch(request));
        return;
    }

    const accept = request.headers.get("accept") || "";
    const isNavigation =
        request.mode === "navigate" || accept.includes("text/html");

    // Never cache HTML navigations
    if (isNavigation) {
        event.respondWith(
            (async () => {
                try {
                    return await fetch(request);
                } catch (err) {
                    const cached = await caches.match("/index.html");
                    if (cached) return cached;
                    throw err;
                }
            })()
        );
        return;
    }

    const isStaticAsset =
        request.destination === "style" ||
        request.destination === "script" ||
        request.destination === "image" ||
        request.destination === "font" ||
        url.pathname.startsWith("/css/") ||
        url.pathname.startsWith("/js/") ||
        url.pathname.startsWith("/images/") ||
        url.pathname.startsWith("/icons/") ||
        url.pathname.startsWith("/animations/") ||
        url.pathname.startsWith("/video/");

    if (!isStaticAsset) return;

    event.respondWith(
        (async () => {
            try {
                const cached = await caches.match(request);
                if (cached) {
                    // stale-while-revalidate
                    event.waitUntil(
                        (async () => {
                            const response = await fetch(request);
                            if (response && response.ok) {
                                const cache = await caches.open(CACHE_NAME);
                                await cache.put(request, response.clone());
                            }
                        })()
                    );
                    return cached;
                }

                const response = await fetch(request);
                if (response && response.ok) {
                    const cache = await caches.open(CACHE_NAME);
                    await cache.put(request, response.clone());
                }
                return response;
            } catch (err) {
                const cached = await caches.match(request);
                if (cached) return cached;
                throw err;
            }
        })()
    );
});
