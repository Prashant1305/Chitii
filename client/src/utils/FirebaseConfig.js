import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { addFcmTokenApi } from "./ApiUtils";

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_APIKEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTHDOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

const requestPushNotificationPermission = async () => {
    try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            // console.log("VAPID Key:", process.env.REACT_APP_FIREBASE_VAPID_KEY);

            const token = await getToken(messaging, {
                vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY,
            });

            if (token) {
                // console.log("FCM Token:", token);
                localStorage.setItem("fcm_token", token);
                const res = await addFcmTokenApi(token);
                // console.log(res.data.msg);
            } else {
                console.log("No registration token available.");
            }
        } else {
            console.log("Permission denied.");
        }
    } catch (error) {
        console.error("Error requesting push notifications:", error);
    }
};
// foreground message can be handled here
onMessage(messaging, (payload) => {
    console.log({ 'Received message': payload });
    // new Notification(payload.notification.title, {
    //     body: "payload.notification.body",
    //     icon: "/logo192.png", // Change to your app icon
    // });
})
export { onMessage, requestPushNotificationPermission, messaging };
