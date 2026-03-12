// js/admin.js

import { db } from "./firebase.js";
import { addActivity } from "../js/activity.js";

import {
collection,
addDoc,
serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


/* =========================================
   SEND NOTIFICATION FUNCTION
========================================= */

export async function sendNotification(to, title, message) {

  try {

    const docRef = await addDoc(collection(db, "notifications"), {

      to: to,                 // "all" OR specific flat like "G-2"
      title: title,
      message: message,
      createdAt: serverTimestamp(),
      readBy: []

    });

    console.log("Notification sent:", docRef.id);

  } catch (error) {

    console.error("Notification error:", error);

  }

}


/* =========================================
   ADMIN CREATE DUE
========================================= */

window.createDue = async function () {

  const flat = document.getElementById("flat").value.trim();
  const amount = document.getElementById("amount").value.trim();
  const type = document.getElementById("type").value;
  const month = document.getElementById("month").value;

  if (!flat || !amount || !month) {

    alert("Please fill all fields");
    return;

  }

  try {

    /* CREATE DUE */

    await addDoc(collection(db, "dues"), {

      flat: flat,
      amount: amount,
      type: type,
      month: month,
      status: "pending",
      createdAt: serverTimestamp()

    });

    console.log("Due created for flat:", flat);


    /* SEND NOTIFICATION TO THAT FLAT */

    await sendNotification(

      flat,
      "New Due Added",
      `₹${amount} ${type} bill for ${month}`

    );


    alert("Due created successfully");


    /* CLEAR FORM */

    document.getElementById("flat").value = "";
    document.getElementById("amount").value = "";

  } catch (error) {

    console.error("Create Due Error:", error);
    alert("Failed to create due");

  }

};


/* =========================================
   ADMIN SEND CUSTOM NOTIFICATION
========================================= */

window.sendNotificationAdmin = async function () {

  const title = document.getElementById("nTitle").value.trim();
  const message = document.getElementById("nMessage").value.trim();

  if (!title || !message) {

    alert("Fill all fields");
    return;

  }

  try {

    await sendNotification(

      "all",
      title,
      message

    );

    alert("Notification sent");

    document.getElementById("nTitle").value = "";
    document.getElementById("nMessage").value = "";

  } catch (error) {

    console.error("Notification send error:", error);

  }

};


/* =========================================
   NAVIGATION HELPERS
========================================= */

window.goBack = function () {

  if (window.history.length > 1) {

    window.history.back();

  } else {

    window.location.href = "../dashboard.html";

  }

};


window.goTo = function (page) {

  window.location.href = page;

};


/* =========================================
   ADMIN MENU (PLACEHOLDER)
========================================= */

window.openMenu = function () {

  alert("Admin menu coming soon");

};