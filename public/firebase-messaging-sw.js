// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
// Replace 10.13.2 with latest version of the Firebase JS SDK.
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
    apiKey: "AIzaSyDCob-leU6BtYdfjR0CoAYHdo1Dl-bIQQM",
    authDomain: "aj-empire-project-1ff70.firebaseapp.com",
    projectId: "aj-empire-project-1ff70",
    storageBucket: "aj-empire-project-1ff70.firebasestorage.app",
    messagingSenderId: "979966867892",
    appId: "1:979966867892:web:f253c0209786c1348c5ae1",
    measurementId: "G-TXVDN58E4F"
});


// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    // THE DUPLICATE-NOTIFICATION FIX.
    //
    // The FCM SDK already calls showNotification() itself for any message
    // carrying a `notification` payload, and it does that BEFORE handing the
    // message to this callback. Rendering it again here is what produced two
    // notifications for every push. So when the SDK has already shown one,
    // bail and let its copy stand.
    //
    // Data-only messages (no `notification` key) are never auto-displayed,
    // which makes them the shape to prefer: they're the only way to control
    // the icon, tag and click-through target from this file. Switch the
    // backend to data-only and everything below takes over.
    if (payload.notification) return;

    const data = payload.data || {};

    self.registration.showNotification(data.title || 'Notification', {
        body: data.body || '',
        icon: data.icon || '/favicon.png',
        // A shared tag REPLACES an existing notification instead of stacking
        // another one, so a redelivery can't pile up a second copy.
        tag: data.tag || data.notificationId || 'ajempire-notification',
        data: { url: data.link || '/' }
    });
});

// Without this, a data-only notification does nothing when clicked — the
// SDK's auto-displayed ones open the app for free, so this keeps the
// data-only path from being a downgrade.
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = (event.notification.data && event.notification.data.url) || '/';

    event.waitUntil(
        self.clients
            .matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Reuse an already-open tab rather than piling up new ones.
                for (const client of clientList) {
                    if ('focus' in client) {
                        client.navigate(url);
                        return client.focus();
                    }
                }
                return self.clients.openWindow(url);
            })
    );
});