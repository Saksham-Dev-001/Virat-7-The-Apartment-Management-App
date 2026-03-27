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
user.email?.split("@")[0] ||
"User",

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

try{

const ref = doc(db, "users", user.uid);

const snap = await getDoc(ref);

if (!snap.exists()) {

await setDoc(ref, {

name:
user.displayName ||
user.email?.split("@")[0] ||
"User",

email: user.email,

flat: "",

phone: "",

role: "resident",

status: "active",

password: "",

sessionId: createSessionId(),

createdAt: serverTimestamp()

});

saveUserCache(user);

} else {

const data = snap.data();

/* ensure session id */

if (!data.sessionId) {

await setDoc(
ref,
{ sessionId: createSessionId() },
{ merge: true }
);

}

saveUserCache(user, data);

}

}catch(e){

console.log("ensureUserDoc error:", e);

}

}


/* ===========================
GLOBAL AUTH LISTENER
=========================== */

onAuthStateChanged(auth, async (user) => {

if (!user) return;

try {

await ensureUserDoc(user);

/* store password once */

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

/* analytics */
if(window.gtag){
gtag('event','login',{method:'google'});
}

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

/* store password (optional system) */
await setDoc(
doc(db, "users", cred.user.uid),
{ password },
{ merge: true }
);

/* analytics */
if(window.gtag){
gtag('event','login',{method:'email'});
}

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

/* analytics */
if(window.gtag){
gtag('event','logout');
}

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

try{

const cred =
EmailAuthProvider.credential(
user.email,
oldPass
);

await reauthenticateWithCredential(
user,
cred
);

await updatePassword(
user,
newPass
);

alert("Password updated");

}catch(e){

alert("Password change failed");

}

}


/* ===========================
PROTECT PAGE (STABLE)
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

setTimeout(() => {

if (!auth.currentUser) {

location.replace("../login.html");

}

}, 3500);

} else {

location.replace("../login.html");

}

}

});


/* fallback */

setTimeout(() => {

if (!checked && !appMode) {

location.replace("../login.html");

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