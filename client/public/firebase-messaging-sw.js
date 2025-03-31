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
    apiKey: "AIzaSyBywYuXDOrDFzCjElUKl4mSp-WfOpyCjXI",
    authDomain: "chitii-7acd3.firebaseapp.com",
    projectId: "chitii-7acd3",
    storageBucket: "chitii-7acd3.firebasestorage.app",
    messagingSenderId: "530059363801",
    appId: "1:530059363801:web:a454437b1cae01577085c8",
    measurementId: "G-4ZVRGHYWHM"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log(
        '[firebase-messaging-sw.js] Received background message ',
        payload
    );
    // Customize notification here
    const notificationTitle = payload.data.title;
    const notificationOptions = {
        body: payload.data.body,
        icon: '/chitii_logo.png',
        data: { url: payload.data?.click_action || "https://chitii.com" }
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
    // Handle notification click event
    self.addEventListener("notificationclick", (event) => {
        console.log("Notification clicked:", event.notification);

        event.notification.close(); // Close the notification

        // Open the URL in a new tab or focus existing one
        event.waitUntil(
            clients
                .matchAll({ type: "window", includeUncontrolled: true })
                .then((clientList) => {
                    for (const client of clientList) {
                        if (client.url === event.notification.data.url && "focus" in client) {
                            return client.focus();
                        }
                    }
                    if (clients.openWindow) {
                        return clients.openWindow(event.notification.data.url);
                    }
                })
        );
    });
});