import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  serverTimestamp
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export async function addActivity(title, message, icon = "bell") {
  
  await addDoc(collection(db, "activities"), {
    
    title: title,
    message: message,
    icon: icon,
    time: serverTimestamp()
    
  });
  
}