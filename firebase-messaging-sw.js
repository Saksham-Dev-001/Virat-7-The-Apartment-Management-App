importScripts(
"https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"
);

importScripts(
"https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyAVwrAEwRdfzezhXapOsHGqBBhY6yPv9po",
  authDomain: "maintenance-app-4ecb8.firebaseapp.com",
  projectId: "maintenance-app-4ecb8",
  messagingSenderId: "502422497802",
  appId: "1:502422497802:web:238d78cfd2f4a5f0b28df3"
});

const messaging = firebase.messaging();