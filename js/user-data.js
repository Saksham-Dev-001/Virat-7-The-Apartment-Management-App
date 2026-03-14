// js/user-data.js

import { auth, db } from "./firebase.js";

import {
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";



export function loadUserData(callback) {

  onAuthStateChanged(auth, async (user) => {

    if (!user) {

      window.location.href = "login.html";
      return;

    }

    const userRef =
      doc(db, "users", user.uid);

    const snap =
      await getDoc(userRef);

    let data = {};

    if (snap.exists()) {

      data = snap.data();

    }



    /* =========================
       SESSION CHECK (NEW)
    ========================= */

    const savedSession =
      localStorage.getItem(
        "sessionId"
      );

    if (
      data.sessionId &&
      savedSession &&
      data.sessionId !== savedSession
    ) {

      alert(
        "Logged in from another device"
      );

      await signOut(auth);

      window.location.href =
        "login.html";

      return;

    }



    let updateNeeded = false;



    /* =========================
       UID SAVE
    ========================= */

    if (!data.uid) {

      data.uid = user.uid;

      updateNeeded = true;

    }



    /* =========================
       CREATED DATE FIX
    ========================= */

    if (
      !data.createdAt ||
      isNaN(Number(data.createdAt))
    ) {

      data.createdAt =
        Date.now();

      updateNeeded = true;

    }



    /* =========================
       STATUS DEFAULT
    ========================= */

    if (!data.status) {

      data.status = "active";

      updateNeeded = true;

    }



    /* =========================
       UPDATE FIRESTORE
    ========================= */

    if (updateNeeded) {

      await updateDoc(
        userRef,
        {
          uid: data.uid,
          createdAt:
            data.createdAt,
          status:
            data.status
        }
      );

    }



    /* =========================
       NAME FIX
    ========================= */

    const name =
      data.name ||
      user.displayName ||
      user.email.split("@")[0];



    /* =========================
       CALLBACK
    ========================= */

    callback({

      name: name,

      email: user.email,

      flat:
        data.flat || "-",

      phone:
        data.phone || "-",

      role:
        data.role || "resident",

      uid:
        data.uid,

      createdAt:
        Number(
          data.createdAt
        ),

      status:
        data.status || "active"

    });

  });

}