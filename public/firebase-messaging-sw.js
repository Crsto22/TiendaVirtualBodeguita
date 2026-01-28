// Firebase Messaging Service Worker
// Este archivo maneja las notificaciones push cuando la app está en background

importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Configuración de Firebase (se inicializa con valores del cliente)
// Nota: Estos valores se configuran automáticamente cuando el messaging se inicializa
firebase.initializeApp({
    apiKey: "AIzaSyBQxWn4Fa7MPZCrJt6e1EN4o339IW1wfVs",
    authDomain: "vanesa-e39df.firebaseapp.com",
    projectId: "vanesa-e39df",
    storageBucket: "vanesa-e39df.firebasestorage.app",
    messagingSenderId: "676911361120",
    appId: "1:676911361120:web:887e7d49667a92623d2705",
    measurementId: "G-EH8T1TG6J2"
});

const messaging = firebase.messaging();

// Manejar notificaciones en background
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Notificación recibida en background:', payload);

    const notificationTitle = payload.notification?.title || 'Tienda Bodeguita';
    const notificationOptions = {
        body: payload.notification?.body || 'Tienes una nueva notificación',
        icon: '/LogoPWA.png',
        badge: '/LogoPWA.png',
        tag: payload.data?.orderId || 'general',
        data: payload.data,
        vibrate: [200, 100, 200],
        actions: [
            {
                action: 'ver',
                title: 'Ver pedido'
            }
        ]
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Manejar clic en la notificación
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notificación clickeada:', event);

    event.notification.close();

    // Abrir la URL específica según los datos de la notificación
    const orderId = event.notification.data?.orderId;
    const urlToOpen = orderId
        ? `/pedidos/${orderId}`
        : '/pedidos';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((windowClients) => {
                // Si ya hay una ventana abierta, enfocarla
                for (const client of windowClients) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        client.navigate(urlToOpen);
                        return client.focus();
                    }
                }
                // Si no hay ventana abierta, abrir una nueva
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});
