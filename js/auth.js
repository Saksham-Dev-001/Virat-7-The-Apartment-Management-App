// js/auth.js

import { auth, db } from "./firebase.js";

import {
GoogleAuthProvider,
signInWithPopup,
signInWithEmailAndPassword,
signOut,
onAuthStateChanged,
updatePassword,
EmailAuthProvider,
reauthenticateWithCredential
}
from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
doc,
getDoc,
setDoc,
serverTimestamp
}
from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


/* ===========================
PROVIDER
=========================== */

const provider = new GoogleAuthProvider();



/* ===========================
CHECK IF APP MODE (PWA)
=========================== */

function isStandalone() {

return (
window.matchMedia("(display-mode: standalone)").matches ||
window.navigator.standalone === true
);

}



/* ===========================
SESSION ID
=========================== */

function createSessionId() {

return Date.now() + "_" +
Math.random().toString(36).slice(2);

}



/* ===========================
CACHE USER
=========================== */

function saveUserCache(user, extra = {}) {

const cache = {

name:
extra.name ||
user.displayName ||
user.email.split("@")[0],

email: user.email,

flat: extra.flat || "-",

phone: extra.phone || "-",

role: extra.role || "resident",

uid: user.uid

};

localStorage.setItem(
"userCache",
JSON.stringify(cache)
);

}



/* ===========================
ENSURE USER DOC
=========================== */

async function ensureUserDoc(user) {

const ref = doc(db, "users", user.uid);

const snap = await getDoc(ref);

if (!snap.exists()) {

await setDoc(ref, {

name:
user.displayName ||
user.email.split("@")[0],

email: user.email,

flat: "",

phone: "",

role: "resident",

status: "active",

password: "",

sessionId: createSessionId(),

createdAt: serverTimestamp()

});

} else {

const data = snap.data();

if (!data.sessionId) {

await setDoc(
ref,
{ sessionId: createSessionId() },
{ merge: true }
);

}

saveUserCache(user, data);

}

}



/* ===========================
GLOBAL AUTH LISTENER
=========================== */

onAuthStateChanged(auth, async (user) => {

if (!user) return;

try {

await ensureUserDoc(user);

const pass =
sessionStorage.getItem("loginPass");

if (pass) {

await setDoc(
doc(db, "users", user.uid),
{ password: pass },
{ merge: true }
);

sessionStorage.removeItem("loginPass");

}

} catch (e) {

console.log("Auth listener error:", e);

}

});



/* ===========================
GOOGLE LOGIN
=========================== */

export async function googleLogin() {

try {

const cred =
await signInWithPopup(
auth,
provider
);

await ensureUserDoc(cred.user);

location.replace("../dashboard.html");

} catch (e) {

console.error(e);
alert(e.message);

}

}



/* ===========================
EMAIL LOGIN
=========================== */

export async function emailLogin(
email,
password
) {

try {

const cred =
await signInWithEmailAndPassword(
auth,
email,
password
);

await ensureUserDoc(cred.user);

await setDoc(
doc(db, "users", cred.user.uid),
{ password },
{ merge: true }
);

location.replace("../dashboard.html");

} catch (e) {

console.error(e);
alert(e.message);

}

}



/* ===========================
LOGOUT
=========================== */

export async function logoutUser() {

try {

localStorage.removeItem("userCache");

await signOut(auth);

location.replace("../login.html");

} catch (e) {

console.log(e);

}

}



/* ===========================
CHANGE PASSWORD
=========================== */

export async function changeUserPassword(
oldPass,
newPass
) {

const user = auth.currentUser;

if (!user) return;

const cred =
EmailAuthProvider.credential(
user.email,
oldPass
);

await reauthenticateWithCredential(
user,
cred);

await updatePassword(
user,
newPass
);

}



/* ===========================
PROTECT PAGE (FINAL STABLE)
=========================== */

export function protectPage() {

let checked = false;

const appMode = isStandalone();

const unsub =
onAuthStateChanged(auth, (user) => {

checked = true;

unsub();

if (!user) {

if (appMode) {

/* wait longer in PWA */

setTimeout(() => {

if (!auth.currentUser) {

location.replace("../login.html");

}

}, 4000);

} else {

location.replace("../login.html");

}

}

});


/* slow restore fix */

setTimeout(() => {

if (!checked) {

if (!appMode) {

location.replace("../login.html");

}

}

}, 2500);

}



/* ===========================
REDIRECT IF LOGGED IN
=========================== */

export function redirectIfLoggedIn() {

onAuthStateChanged(auth, (user) => {

if (user) {

location.replace("../dashboard.html");

}

});

}