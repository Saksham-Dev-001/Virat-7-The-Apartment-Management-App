// js/notices.js

import { db } from "./firebase.js";
import { addActivity } from "./activity.js";

import {
collection,
addDoc,
query,
orderBy,
serverTimestamp,
deleteDoc,
doc,
updateDoc,
onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { sendNotification } from "./admin.js";


/* =========================================
ADMIN POST / UPDATE NOTICE
========================================= */

window.publishNotice = async function () {

const title = document.getElementById("noticeTitle")?.value.trim();
const message = document.getElementById("noticeMessage")?.value.trim();

if (!title || !message) {
alert("Please fill all fields");
return;
}

try {

if(window.editingNotice){

await updateDoc(doc(db,"notices",window.editingNotice),{
title:title,
message:message
});

window.editingNotice=null;

alert("Notice updated");

}else{

await addDoc(collection(db,"notices"),{
title:title,
message:message,
createdAt:serverTimestamp(),
pinned:false
});

try{
await sendNotification("all","New Notice",title);
}catch(e){
console.warn("Push failed:",e);
}

addActivity("Notice posted",title,"bullhorn");

alert("Notice posted successfully");

}

document.getElementById("noticeTitle").value="";
document.getElementById("noticeMessage").value="";

}catch(error){

console.error("Notice Post Error:",error);
alert("Failed to post notice");

}

};



/* =========================================
DELETE NOTICE
========================================= */

window.deleteNotice = async function(id){

if(!confirm("Delete this notice?")) return;

try{

await deleteDoc(doc(db,"notices",id));

alert("Notice deleted");

}catch(err){

console.error(err);
alert("Delete failed");

}

};



/* =========================================
PIN NOTICE
========================================= */

window.pinNotice = async function(id,current){

try{

await updateDoc(doc(db,"notices",id),{
pinned:!current
});

}catch(err){

console.error(err);

}

};



/* =========================================
EDIT NOTICE
========================================= */

window.editNotice = function(id,title,message){

document.getElementById("noticeTitle").value=title;
document.getElementById("noticeMessage").value=message;

window.editingNotice=id;

};



/* =========================================
LOAD NOTICES (REALTIME)
========================================= */

export function loadNotices(){

const container=document.getElementById("noticeList");

if(!container) return;

const q=query(
collection(db,"notices"),
orderBy("createdAt","desc")
);

onSnapshot(q,(snapshot)=>{

container.innerHTML="";

if(snapshot.empty){

container.innerHTML=`
<div class="empty">
<i class="fa-solid fa-bullhorn"></i>
<p>No notices yet</p>
</div>
`;
return;

}

let pinned=[];
let normal=[];

snapshot.forEach(docSnap=>{
const data=docSnap.data();

const card=`

<div class="notice-card">

<div class="notice-header">

<div class="notice-title">
<i class="fa-solid fa-bullhorn"></i>
${data.title}
</div>

<div class="notice-actions">

<button onclick="editNotice('${docSnap.id}','${data.title}','${data.message}')">
<i class="fa-solid fa-pen"></i>
</button>

<button onclick="deleteNotice('${docSnap.id}')">
<i class="fa-solid fa-trash"></i>
</button>

<button onclick="pinNotice('${docSnap.id}',${data.pinned || false})">
<i class="fa-solid fa-thumbtack"></i>
</button>

</div>

</div>

<div class="notice-desc">
${data.message}
</div>

</div>
`;

if(data.pinned){
pinned.push(card);
}else{
normal.push(card);
}

});

container.innerHTML = pinned.join("") + normal.join("");

});

}



/* =========================================
AUTO LOAD
========================================= */

document.addEventListener("DOMContentLoaded",()=>{

loadNotices();

});