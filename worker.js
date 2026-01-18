const CACHE_NAME = 'pwa-v5';
const ASSETS = [
    './',
    './index.html',
    './main.js',
    './offline.html',
    './img/tane.jpg',
    './img/koru.jpg'
];

// Instalación: Guardar archivos estáticos
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
});

// Activación: limpiar caches antiguas si las hubiera
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        })
    );
});

// Estrategia: Cache First (Servir desde caché si existe)

// Estrategia: Cache then Network (stale-while-revalidate)
self.addEventListener('fetch', (event) => {
    // Solo interesan las peticiones GET (evita reintentos de POST/PUT/DELETE)
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith((async () => {
        // Intenta devolver respuesta en caché inmediatamente
        const cachedResponse = await caches.match(event.request);

        // Mientras tanto, intenta obtener una versión actualizada de la red
        const networkResponsePromise = fetch(event.request)
            .then((networkResponse) => {
                // Si la respuesta es válida, la guardamos en caché para la próxima vez
                if (networkResponse && networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone).catch(() => { /* fallbacks silenciosos */ });
                    });
                }
                return networkResponse;
            })
            .catch(() => {
                // Si la red falla, devolvemos undefined aquí; el fallback se maneja abajo
                return undefined;
            });

        // Si hay algo en caché, devuélvelo de inmediato y actualiza la caché en segundo plano.
        if (cachedResponse) {
            // Kick off the network update but don't await it here (stale-while-revalidate)
            networkResponsePromise.catch(() => {});
            return cachedResponse;
        }

        // Si no hay caché, espera la respuesta de la red.
        const networkResponse = await networkResponsePromise;
        if (networkResponse) return networkResponse;

        // Si todo falla (sin caché y sin red), intenta devolver una página offline
        return caches.match('./offline.html');
    })());
});

