const CACHE_NAME = 'pwa-v3';
const JSON_URL = 'mokoDB.json';
const STATIC_ASSETS = [
    './',
    'index.html',
    'main.js',
    'manifest.json',
    JSON_URL
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            // 1. Guardamos los archivos estáticos básicos
            await cache.addAll(STATIC_ASSETS);

            // 2. Leemos el JSON para encontrar las imágenes
            try {
                const response = await fetch(JSON_URL);
                const data = await response.json();
                const imageUrls = data.map(item => item.img);
                console.log('Precargando imágenes del JSON:', imageUrls);
                return cache.addAll(imageUrls);
            } catch (err) {
                console.error('Error precargando imágenes:', err);
            }
        })
    );
});

// Estrategia de red: Cache First para las imágenes
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => {
            return response || fetch(e.request);
        })
    );
});
