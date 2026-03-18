// js/user-data.js

import { auth, db } from "./firebase.js";

import {
doc,
getDoc,
updateDoc
} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
onAuthStateChanged,
signOut
} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


let listenerStarted = false;
let memoryCache = null;


export function loadUserData(callback) {

if (listenerStarted) return;
listenerStarted = true;

let authReady = false;


/* =========================
1. MEMORY CACHE (fastest)
========================= */

if (memoryCache && callback) {
callback(memoryCache);
}


/* =========================
2. LOCAL CACHE (instant UI)
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
3. AUTH LISTENER (background)
========================= */

onAuthStateChanged(auth, async (user) => {

authReady = true;

if (!user) {

setTimeout(() => {

if (!auth.currentUser) {
location.replace("../login.html");
}

}, 1200);

return;

}


try {

const userRef =
doc(db, "users", user.uid);

let snap;

try {

snap = await getDoc(userRef);

} catch (e) {

console.log("getDoc error", e);
return;

}


let data = {};

if (snap.exists()) {
data = snap.data();
}


/* =========================
SESSION CHECK
========================= */

try {

const savedSession =
localStorage.getItem("sessionId");

if (
data.sessionId &&
savedSession &&
data.sessionId !== savedSession
) {

await signOut(auth);
location.replace("../login.html");
return;

}

} catch (e) {
console.log("session check error", e);
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
BUILD USER OBJECT
========================= */

const name =
data.name ||
user.displayName ||
(user.email ? user.email.split("@")[0] : "User");


const userObj = {

name: name,
email: user.email || "",
flat: data.flat || "-",
phone: data.phone || "-",
role: data.role || "resident",
uid: data.uid,
createdAt: Number(data.createdAt) || Date.now(),
status: data.status || "active"

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
UPDATE UI AGAIN (sync)
========================= */

if (callback) {
callback(userObj);
}


} catch (err) {

console.log("loadUserData error", err);

}

});


/* =========================
AUTH DEBUG (safe)
========================= */

setTimeout(() => {

if (!authReady) {
console.log("Auth slow...");
}

}, 2000);

}