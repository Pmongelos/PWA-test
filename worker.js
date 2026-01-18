const CACHE_NAME = 'pwa-v1';
const ASSETS = [
    './',
    './index.html',
    './main.js',
    './img/tane.jpg'
];

// Instalación: Guardar archivos estáticos
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
});

// Estrategia: Cache First (Servir desde caché si existe)

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            // Devuelve el recurso de la caché o lo busca en internet
            return response || fetch(event.request);
        }).catch(() => {
            // Opcional: Si falla todo (estás offline y no hay caché), 
            // podrías devolver una página offline.html aquí
        })
    );
});

