// js/firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getAuth,
setPersistence,
browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
getFirestore
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyAVwrAEwRdfzezhXapOsHGqBBhY6yPv9po",
  authDomain: "maintenance-app-4ecb8.firebaseapp.com",
  projectId: "maintenance-app-4ecb8",
  storageBucket: "maintenance-app-4ecb8.firebasestorage.app",
  messagingSenderId: "502422497802",
  appId: "1:502422497802:web:238d78cfd2f4a5f0b28df3"
};


const app = initializeApp(firebaseConfig);


/* ✅ AUTH */

const auth = getAuth(app);

/* force persistent login */
setPersistence(auth, browserLocalPersistence)
.catch((e)=>{
console.log("Persistence error", e);
});


/* ✅ FIRESTORE */

const db = getFirestore(app);


export { auth, db };