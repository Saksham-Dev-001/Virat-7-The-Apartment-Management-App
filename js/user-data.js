// js/user-data.js

import { auth, db } from "./firebase.js";

import {
doc,
getDoc,
updateDoc
}
from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
onAuthStateChanged,
signOut
}
from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


let listenerStarted = false;
let memoryCache = null;



/* =========================
CHECK PWA MODE
========================= */

function isStandalone() {

return (
window.matchMedia("(display-mode: standalone)").matches ||
window.navigator.standalone === true
);

}



/* =========================
LOAD USER DATA
========================= */

export function loadUserData(callback) {

if (listenerStarted) return;
listenerStarted = true;

let authReady = false;



/* =========================
1. MEMORY CACHE (instant)
========================= */

if (memoryCache && callback) {
callback(memoryCache);
}



/* =========================
2. LOCAL CACHE (fast UI)
========================= */

try {

const cache =
localStorage.getItem("userCache");

if (cache) {

const data = JSON.parse(cache);

memoryCache = data;

if (callback) callback(data);

}

} catch (e) {
console.log("cache error", e);
}



/* =========================
3. AUTH LISTENER
========================= */

onAuthStateChanged(auth, async (user) => {

authReady = true;

const appMode = isStandalone();


/* -------------------------
NO USER
------------------------- */

if (!user) {

setTimeout(() => {

if (!auth.currentUser) {

if (appMode) {

/* wait more in PWA */

setTimeout(() => {

if (!auth.currentUser) {
location.replace("../login.html");
}

}, 3000);

} else {

location.replace("../login.html");

}

}

}, 1500);

return;

}


/* -------------------------
LOAD FIRESTORE
------------------------- */

try {

const userRef =
doc(db, "users", user.uid);

const snap =
await getDoc(userRef);

let data = {};

if (snap.exists()) {
data = snap.data();
}



/* =========================
SESSION CHECK (SAFE)
========================= */

try {

const savedSession =
localStorage.getItem("sessionId");


/* save if missing */

if (data.sessionId && !savedSession) {

localStorage.setItem(
"sessionId",
data.sessionId
);

}


/* mismatch */

if (
data.sessionId &&
savedSession &&
data.sessionId !== savedSession
) {

console.log("Session mismatch");


setTimeout(() => {

if (auth.currentUser) {

signOut(auth);
location.replace("../login.html");

}

}, 2000);

return;

}

} catch (e) {

console.log("session error", e);

}



/* =========================
FIX FIELDS
========================= */

let updateNeeded = false;

if (!data.uid) {
data.uid = user.uid;
updateNeeded = true;
}

if (!data.createdAt) {
data.createdAt = Date.now();
updateNeeded = true;
}

if (!data.status) {
data.status = "active";
updateNeeded = true;
}


if (updateNeeded) {

try {

await updateDoc(userRef, {
uid: data.uid,
createdAt: data.createdAt,
status: data.status
});

} catch (e) {
console.log("update error", e);
}

}



/* =========================
BUILD USER
========================= */

const name =
data.name ||
user.displayName ||
(user.email
? user.email.split("@")[0]
: "User");


const userObj = {

name: name,
email: user.email || "",
flat: data.flat || "-",
phone: data.phone || "-",
role: data.role || "resident",
uid: data.uid,
createdAt:
Number(data.createdAt) ||
Date.now(),
status:
data.status || "active"

};



/* =========================
SAVE CACHE
========================= */

memoryCache = userObj;

try {

localStorage.setItem(
"userCache",
JSON.stringify(userObj)
);

} catch (e) {}



/* =========================
CALLBACK
========================= */

if (callback) {
callback(userObj);
}


} catch (err) {

console.log(
"loadUserData error",
err
);

}

});



/* =========================
AUTH DEBUG
========================= */

setTimeout(() => {

if (!authReady) {
console.log("Auth slow...");
}

}, 3000);

}