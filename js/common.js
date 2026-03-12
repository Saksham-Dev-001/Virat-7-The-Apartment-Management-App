// js/common.js

import { logoutUser } from "./auth.js";

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

window.showToast = function (message) {
  alert(message);
};

window.logoutUser = logoutUser;

window.confirmLogout = function () {

  if (confirm("Are you sure you want to logout?")) {
    logoutUser();
  }

};




if ("serviceWorker" in navigator) {

navigator.serviceWorker.register("/sw.js")
.then(() => console.log("Service Worker Registered"));

}