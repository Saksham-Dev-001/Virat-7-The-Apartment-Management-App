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
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const provider = new GoogleAuthProvider();



/* ===========================
   ENSURE USER DOC
=========================== */

async function ensureUserDoc(user) {

  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {

    await setDoc(ref, {
      name: user.displayName || user.email.split("@")[0],
      email: user.email,
      flat: "",
      phone: "",
      role: "resident",
      status: "active",
      password: "",
      createdAt: serverTimestamp()
    });

  }

}



/* ===========================
   AUTH LISTENER
=========================== */

onAuthStateChanged(auth, async (user) => {

  if (!user) return;

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

    const user = cred.user;

    await ensureUserDoc(user);

    window.location.href =
      "../dashboard.html";

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

    const user = cred.user;

    await ensureUserDoc(user);

    await setDoc(
      doc(db, "users", user.uid),
      { password },
      { merge: true }
    );

    window.location.href =
      "../dashboard.html";

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

    await signOut(auth);

    window.location.href =
      "../login.html";

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
    newPass
  );

}



/* ===========================
   PAGE PROTECTION
=========================== */

export function protectPage() {

  onAuthStateChanged(
    auth,
    (user) => {

      if (!user) {

        window.location.href =
          "../login.html";

      }

    }
  );

}



/* ===========================
   REDIRECT IF LOGGED IN
=========================== */

export function redirectIfLoggedIn() {

  onAuthStateChanged(
    auth,
    (user) => {

      if (user) {

        window.location.href =
          "../dashboard.html";

      }

    }
  );

}