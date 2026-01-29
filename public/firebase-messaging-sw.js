importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyBQxWn4Fa7MPZCrJt6e1EN4o339IW1wfVs",
    authDomain: "vanesa-e39df.firebaseapp.com",
    projectId: "vanesa-e39df",
    storageBucket: "vanesa-e39df.firebasestorage.app",
    messagingSenderId: "676911361120",
    appId: "1:676911361120:web:887e7d49667a92623d2705",
});

const messaging = firebase.messaging();

/* 🔔 MOSTRAR LA NOTIFICACIÓN MANUALMENTE */
messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Push recibido:', payload);

    const title = payload.data?.data_title || 'Nuevo mensaje';
    const body = payload.data?.data_body || '';
    const orderId = payload.data?.orderId;

    self.registration.showNotification(title, {
        body,
        icon: '/LogoPWA.png',
        badge: '/LogoPWA.png',
        data: {
            orderId
        }
    });
});

/* 👉 Click */
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const orderId = event.notification.data?.orderId;
    const urlToOpen = orderId ? `/pedidos/${orderId}` : '/pedidos';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientsArr) => {
                for (const client of clientsArr) {
                    if ('focus' in client) {
                        client.navigate(urlToOpen);
                        return client.focus();
                    }
                }
                return clients.openWindow(urlToOpen);
            })
    );
});
