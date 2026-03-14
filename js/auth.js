// js/auth.js

import { auth, db } from "./firebase.js";

import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const provider = new GoogleAuthProvider();


/* =====================================
   ENSURE USER DOCUMENT EXISTS
===================================== */

async function ensureUserDoc(user) {

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {

    await setDoc(userRef, {
      name: user.displayName || user.email.split("@")[0],
      email: user.email,
      flat: "",
      phone: "",
      role: "resident",
      status: "active",
      createdAt: serverTimestamp()
    });

    console.log("New user created:", user.email);

  }

}


/* =====================================
   AUTH STATE LISTENER
===================================== */

onAuthStateChanged(auth, async (user) => {

  if (user) {

    await ensureUserDoc(user);

  }

});


/* =====================================
   GOOGLE LOGIN
===================================== */

export async function googleLogin() {

  try {

    await signInWithPopup(auth, provider);

    window.location.replace("/dashboard.html");

  } catch (error) {

    console.error("Google Login Error:", error);
    alert(error.message);

  }

}


/* =====================================
   EMAIL LOGIN
===================================== */

export async function emailLogin(email, password) {

  try {

    await signInWithEmailAndPassword(auth, email, password);

    window.location.replace("/dashboard.html");

  } catch (error) {

    console.error("Login Error:", error);
    alert(error.message);

  }

}


/* =====================================
   LOGOUT  ✅ FIXED
===================================== */

export async function logoutUser() {

  try {

    await signOut(auth);

    window.location.replace("/login.html");

  } catch (error) {

    console.error("Logout Error:", error);
    alert("Logout failed");

  }

}


/* =====================================
   PAGE PROTECTION
===================================== */

export function protectPage() {

  onAuthStateChanged(auth, (user) => {

    if (!user) {

      window.location.replace("/login.html");

    }

  });

}


/* =====================================
   REDIRECT IF ALREADY LOGGED IN
===================================== */

export function redirectIfLoggedIn() {

  onAuthStateChanged(auth, (user) => {

    if (user) {

      window.location.replace("/dashboard.html");

    }

  });

}