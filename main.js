// 1. Registro del Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('worker.js')
        .then(() => console.log("Service Worker registrado"));
}

// 2. Configuración de la Base de Datos (IndexedDB)
let db;
const request = indexedDB.open("PWA_DB", 1);

request.onupgradeneeded = (e) => {
    db = e.target.result;
    db.createObjectStore("mensajes", { keyPath: "id", autoIncrement: true });
};

request.onsuccess = (e) => {
    db = e.target.result;
    displayMessages();
};

// 3. Funciones de la Aplicación
function saveMessage() {
    const text = document.getElementById('msgInput').value;
    if (!text) return;

    const transaction = db.transaction(["mensajes"], "readwrite");
    const store = transaction.objectStore("mensajes");
    const nuevoMensaje = { texto: text, fecha: new Date().toLocaleString() };
    
    store.add(nuevoMensaje);
    transaction.oncomplete = () => {
        document.getElementById('msgInput').value = '';
        displayMessages();
    };
}

function displayMessages() {
    const list = document.getElementById('msgList');
    list.innerHTML = "";
    const store = db.transaction("mensajes").objectStore("mensajes");
    
    store.openCursor().onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
            list.innerHTML += `<li>${cursor.value.texto} <small>${cursor.value.fecha}</small></li>`;
            cursor.continue();
        }
    };
}
