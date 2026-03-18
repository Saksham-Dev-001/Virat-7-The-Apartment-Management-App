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
SESSION ID
=========================== */

function createSessionId() {

return Date.now() + "_" +
Math.random().toString(36).slice(2);

}



/* ===========================
CACHE USER (instant UI)
=========================== */

function saveUserCache(user, extra = {}) {

const cache = {

name:
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

await setDoc(
ref,
{
sessionId: createSessionId()
},
{ merge: true }
);

}

}



/* ===========================
GLOBAL AUTH LISTENER
=========================== */

onAuthStateChanged(auth, async (user) => {

if (!user) return;

try {

await ensureUserDoc(user);

saveUserCache(user);

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

saveUserCache(cred.user);

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

saveUserCache(cred.user);

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
cred
);

await updatePassword(
user,
newPass);

}



/* ===========================
PROTECT PAGE (stable)
=========================== */

export function protectPage() {

let checked = false;

const unsub =
onAuthStateChanged(auth, (user) => {

checked = true;

unsub();

if (!user) {

location.replace("../login.html");

}

});


setTimeout(() => {

if (!checked) {

setTimeout(() => {

if (!auth.currentUser) {

location.replace("../login.html");

}

}, 4000);

}

}, 1500);

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