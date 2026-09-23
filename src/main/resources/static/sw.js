const CACHE_NAME = "livestock-health-v1";

const APP_SHELL = [
    "/",
    "/index.html",
    "/style.css",
    "/script.js",
    "/map.js",
    "/risk-dashboard.js",
    "/veterinary-action.js",
    "/lab-referral.js",
    "/field-mode.js",
    "/images/livestock-logo.png"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", event => {
    const request = event.request;

    if (request.method !== "GET") {
        return;
    }

    event.respondWith(
        caches.match(request)
            .then(cachedResponse => {

                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(request)
                    .then(response => {

                        if (
                            response &&
                            response.status === 200 &&
                            response.type === "basic"
                        ) {
                            const copy = response.clone();

                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(request, copy);
                                });
                        }

                        return response;
                    })
                    .catch(() =>
                        caches.match("/index.html")
                    );
            })
    );
});