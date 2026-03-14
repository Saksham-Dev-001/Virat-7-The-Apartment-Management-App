importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");


firebase.initializeApp({
  apiKey: "AIzaSyAVwrAEwRdfzezhXapOsHGqBBhY6yPv9po",
  authDomain: "maintenance-app-4ecb8.firebaseapp.com",
  projectId: "maintenance-app-4ecb8",
  storageBucket: "maintenance-app-4ecb8.appspot.com",
  messagingSenderId: "502422497802",
  appId: "1:502422497802:web:238d78cfd2f4a5f0b28df3"
});


const messaging = firebase.messaging();



/* =========================
   BACKGROUND PUSH
========================= */

messaging.onBackgroundMessage((payload) => {

console.log("Background message:", payload);

const title =
payload.notification?.title ||
"VIRAT-7 Notification";


const body =
payload.notification?.body ||
"You have new update";


const clickAction =
payload.data?.url ||
"/dashboard.html";


const options = {

body: body,

icon: "/assets/logo.png",

badge: "/assets/logo.png",

image: "/assets/logo.png",

tag: payload.data?.tag || "virat7",

renotify: true,

requireInteraction: true,

vibrate: [200, 100, 200, 100, 200],

data: {
url: clickAction
}

};


self.registration.showNotification(title, options);

});



/* =========================
   CLICK HANDLER
========================= */

self.addEventListener("notificationclick", (event) => {

event.notification.close();

const url = event.notification.data?.url || "/dashboard.html";

event.waitUntil(

clients.matchAll({ type: "window", includeUncontrolled: true })
.then((clientList) => {

for (const client of clientList) {

if (client.url.includes(url) && "focus" in client) {
return client.focus();
}

}

if (clients.openWindow) {
return clients.openWindow(url);
}

})

);

});