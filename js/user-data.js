// js/user-data.js

import { auth, db } from "./firebase.js";

import {
  doc,
  getDoc,
  updateDoc
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
    
    let updateNeeded = false;
    
    // ✅ UID save
    if (!data.uid) {
      data.uid = user.uid;
      updateNeeded = true;
    }
    
    // ✅ Joined date fix / save
    if (!data.createdAt || isNaN(Number(data.createdAt))) {
      data.createdAt = Date.now(); // always number
      updateNeeded = true;
    }
    
    // ✅ Update firestore if needed
    if (updateNeeded) {
      await updateDoc(userRef, {
        uid: data.uid,
        createdAt: data.createdAt
      });
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
      role: data.role || "resident",
      uid: data.uid,
      createdAt: Number(data.createdAt) // force number
    });
    
  });
  
}