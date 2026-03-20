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
let authResolved = false;



/* =========================
PWA CHECK
========================= */

function isStandalone() {

return (
window.matchMedia("(display-mode: standalone)").matches ||
window.navigator.standalone === true
);

}



/* =========================
LOAD USER
========================= */

export function loadUserData(callback) {

if (listenerStarted) return;
listenerStarted = true;



/* =========================
MEMORY CACHE
========================= */

if (memoryCache && callback) {
callback(memoryCache);
}



/* =========================
LOCAL CACHE
========================= */

try {

const cache =
localStorage.getItem("userCache");

if (cache) {

const data = JSON.parse(cache);

memoryCache = data;

if (callback) callback(data);

}

} catch (e) {}



/* =========================
AUTH LISTENER
========================= */

onAuthStateChanged(auth, async (user) => {

authResolved = true;

const appMode = isStandalone();



/* =========================
NO USER
========================= */

if (!user) {

console.log("No user yet, wait...");

setTimeout(() => {

if (!auth.currentUser) {

if (appMode) {

setTimeout(() => {

if (!auth.currentUser) {

location.replace("../login.html");

}

}, 3500);

} else {

location.replace("../login.html");

}

}

}, 2000);

return;

}



/* =========================
LOAD FIRESTORE
========================= */

try {

const ref =
doc(db, "users", user.uid);

const snap =
await getDoc(ref);

let data = {};

if (snap.exists()) {
data = snap.data();
}



/* =========================
SESSION CHECK SAFE
========================= */

try {

const saved =
localStorage.getItem("sessionId");

if (data.sessionId && !saved) {

localStorage.setItem(
"sessionId",
data.sessionId
);

}

if (
data.sessionId &&
saved &&
saved !== data.sessionId
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

} catch (e) {}



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

await updateDoc(ref, {
uid: data.uid,
createdAt: data.createdAt,
status: data.status
});

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
status: data.status || "active"

};



/* =========================
SAVE CACHE
========================= */

memoryCache = userObj;

localStorage.setItem(
"userCache",
JSON.stringify(userObj)
);



/* =========================
CALLBACK
========================= */

if (callback) {
callback(userObj);
}


/* =========================
HIDE LOADER SAFE
========================= */

if (window.hideLoader) {
hideLoader();
}

} catch (e) {

console.log("loadUser error", e);

}

});



/* =========================
AUTH DEBUG
========================= */

setTimeout(() => {

if (!authResolved) {

console.log("Auth restore slow");

}

}, 3000);

}