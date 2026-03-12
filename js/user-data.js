// js/user-data.js

import { auth, db } from "./firebase.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


export function loadUserData(callback) {

  onAuthStateChanged(auth, async (user) => {

    if (!user) {
      window.location.href = "login.html";
      return;
    }

    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    let data = {};

    if (snap.exists()) {
      data = snap.data();
    }

    const name =
      data.name ||
      user.displayName ||
      user.email.split("@")[0];

    callback({
      name: name,
      email: user.email,
      flat: data.flat || "-",
      phone: data.phone || "-",
      role: data.role || "resident"
    });

  });

}