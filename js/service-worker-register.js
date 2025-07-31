const CACHE_NAME = "digitalyty-v1";
const CACHE_ASSETS = [
    "/",
    "/index.html",
    "/about.html",
    "/accessibility.html",
    "/contact.html",
    "/services.html",
    "/privacy.html",
    "/terms.html",
    "/thank-you.html",
    "/sitemap.html",
    "/sitemap.xml",
    "/style.css",
    "/script.js",
    "/manifest.webmanifest",
    "/service-worker.js",

    // JS
    "/js/accessibility.js",
    "/js/form.js",
    "/js/nav.js",
    "/js/scrollTop.js",
    "/js/service-worker-register.js",

    // Videos
    "/hero-logo-digitalyty.mp4",
    "/Digitalyty2-1.mp4",
    "/video/Digitalyty2.mp4",

    // Images
    "/Digitelyty-logo-3.png",
    "/fon.jpg",
    "/google-background.png",
    "/google-g.svg",
    "/images/business-grow.png",
    "/images/customer-support.png",
    "/images/desktop.png",
    "/images/digital-globe.png",
    "/images/digitalyty-choose.png",
    "/images/digitalyty-mini.jpg",
    "/images/digitalyty-mini.png",
    "/images/favicon-48x48.png",
    "/images/icon-192.png",
    "/images/icon-512.png",
    "/images/landing-page.png",
    "/images/marriage.png",
    "/images/marriage2.png",
    "/images/marriage3.png",
    "/images/portfolio.png",
    "/images/responsive.png",
    "/images/seo.png",
    "/images/tablet-digitalyty.png",
    "/images/20250715_1453_3D Customer Support Elements_simple_compose_01k06ytk0hf77rtdscjpphj7df.png",
    "/images/20250716_0855_Futuristic Portfolio Showcase_simple_compose_01k08wrmbvf5va058vhmz7zznd.png",
    "/images/20250716_0928_Futuristic Holographic Interface_simple_compose_01k08yn3j2f8qb6ngkzkqsdvpb.png",

    // Icons
    "/icons/1.svg",
    "/icons/2.svg",
    "/icons/3.svg",
    "/icons/1-steps.svg",
    "/icons/2-steps.svg",
    "/icons/3-steps.svg",
    "/icons/4-steps.svg",
    "/icons/5-steps.svg",
    "/icons/6-steps.svg",
    "/icons/device-desktop-check.svg",
    "/icons/facebook.svg",
    "/icons/globe.svg",
    "/icons/landing-page-icon.svg",
    "/icons/mail.svg",
    "/icons/phone.svg",
    "/icons/settings.svg",
    "/icons/smartphone.svg",

    // Social icons
    "/icons/social-icons/facebook.svg",
    "/icons/social-icons/mail.svg",
    "/icons/social-icons/phone.svg",
    "/icons/social-icons/whatsApp.svg",

    // Animations (если используешь)
    "/animations/Analytics Character Animation.json",
    "/animations/Analytics Character Animation.lottie",
    "/animations/code dark.json",
];

// Установка: кешируем указанные ресурсы
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(CACHE_ASSETS))
    );
    self.skipWaiting();
});

// Активация: удаляем устаревшие кэши
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((cacheNames) =>
                Promise.all(
                    cacheNames
                        .filter((name) => name !== CACHE_NAME)
                        .map((name) => caches.delete(name))
                )
            )
    );
    self.clients.claim();
});

// Перехват запросов: кеш first, потом сеть
self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;

    event.respondWith(
        caches.match(event.request).then((cached) => {
            return (
                cached ||
                fetch(event.request).catch(
                    () =>
                        caches.match("/offline.html") ||
                        new Response("Offline", { status: 503 })
                )
            );
        })
    );
});
