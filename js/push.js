import { messaging } from "./firebase.js";

import { getToken, onMessage } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js";

import { db } from "./firebase.js";

import { doc, updateDoc } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


export async function enablePush(uid){

try{

/* REGISTER SERVICE WORKER */

const registration = await navigator.serviceWorker.register(
"/firebase-messaging-sw.js"
);


/* ASK NOTIFICATION PERMISSION */

const permission = await Notification.requestPermission();

if(permission !== "granted"){
console.log("Notification permission denied");
return;
}


/* GET FCM TOKEN */

const token = await getToken(messaging,{
vapidKey:"BGNFbZGpetxVCtl5Z9FYDZUyGJ_uBJmkWsE0a1yRL-ruBGevXlmMQFAHL6nBk-LXqPFAfuTE4L8KR_OaVXOT99o",
serviceWorkerRegistration:registration
});


console.log("Push Token:",token);


/* SAVE TOKEN TO FIRESTORE */

await updateDoc(doc(db,"users",uid),{
pushToken:token
});


}catch(err){

console.error("Push error:",err);

}

}


/* =================================
FOREGROUND NOTIFICATION
================================= */

onMessage(messaging,(payload)=>{

console.log("Foreground message:",payload);

const title = payload.notification?.title || "VIRAT-7";

const options = {
body: payload.notification?.body || "",
icon: "/assets/logo.png"
};

new Notification(title,options);

});