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

// Activate a new version of this file IMMEDIATELY instead of parking it in
// "waiting" until every tab of the site is closed.
//
// This matters more than it looks: a service worker only updates when its
// bytes change, and even then the replacement idles while the old one keeps
// handling pushes. That is how a fixed handler can appear not to work — the
// browser is still running the previous one. Specifically, the original
// version of this file read `payload.notification.title` unguarded, which
// throws on the data-only payloads the backend now sends, so a stale copy
// silently shows nothing at all while the foreground path keeps working.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

messaging.onBackgroundMessage((payload) => {
    // The backend sends data-only payloads, which the FCM SDK never renders
    // by itself — showing them is entirely this handler's job, and it is the
    // only path that runs when no tab is open.
    //
    // The guard below is for the other shape: when a message DOES carry a
    // `notification` key, the SDK has already called showNotification()
    // before reaching this callback, so rendering it again here is what
    // produced duplicate notifications. Nothing should be sending that shape
    // any more, but the guard keeps a regression from doubling up again.
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