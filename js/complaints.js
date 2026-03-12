// js/complaints.js

import { auth, db } from "./firebase.js";

import {
collection,
addDoc,
query,
where,
onSnapshot,
serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
doc,
getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const container = document.getElementById("complaintList");

let userData = {};
let currentUser = null;

let shownReplies = new Set();

/* ======================
AUTH CHECK
====================== */

onAuthStateChanged(auth, async (user) => {

if (!user) return;

currentUser = user;

try {

const snap = await getDoc(doc(db,"users",user.uid));

if(snap.exists()){
userData = snap.data();
}

listenComplaints(user.uid);

} catch(err){
console.error("User load error",err);
}

});


/* ======================
SUBMIT COMPLAINT
====================== */

window.submitComplaint = async function(){

const title = document.getElementById("title").value.trim();
const message = document.getElementById("message").value.trim();
const priority = document.getElementById("priority").value;

if(!title || !message){
alert("Please fill all fields");
return;
}

try{

await addDoc(collection(db,"complaints"),{

title,
message,
priority,

status:"open",

userId:currentUser.uid,
userName:userData.name || "Resident",
flat:userData.flat || "N/A",

createdAt:serverTimestamp()

});

document.getElementById("title").value="";
document.getElementById("message").value="";

alert("Complaint submitted");

}catch(err){

console.error("Submit error:",err);
alert("Failed to submit complaint");

}

};


/* ======================
LOAD USER COMPLAINTS
====================== */

function listenComplaints(uid){

if(!container) return;

const q = query(
collection(db,"complaints"),
where("userId","==",uid)
);

onSnapshot(q,(snapshot)=>{

container.innerHTML="";

if(snapshot.empty){

container.innerHTML=`
<div class="empty">
<i class="fa-solid fa-circle-check"></i>
<p>No complaints submitted</p>
</div>
`;

return;

}

snapshot.forEach(docSnap=>{

const d = docSnap.data();
const id = docSnap.id;

let date="";

if(d.createdAt){

const t=d.createdAt.toDate();

date =
t.toLocaleDateString()+" • "+
t.toLocaleTimeString([],{
hour:"2-digit",
minute:"2-digit"
});

}

/* SHOW NOTIFICATION WHEN ADMIN REPLIES */

if(d.adminReply && !shownReplies.has(id)){

showToast("Admin replied to your complaint");

shownReplies.add(id);

}

container.innerHTML+=`

<div class="ticket-card">

<div class="ticket-header">

<div class="ticket-title">
${d.title}
</div>

<div class="ticket-date">
${date}
</div>

</div>

<div class="ticket-desc">
${d.message}
</div>

${d.adminReply ? `
<div class="admin-reply">
<b>Admin Reply:</b><br>
${d.adminReply}
</div>
` : ""}

<div class="badges">

<span class="badge priority">
${d.priority}
</span>

<span class="badge status-${d.status}">
${d.status}
</span>

</div>

</div>

`;

});

});

}


/* ======================
TOAST NOTIFICATION
====================== */

function showToast(msg){

const toast = document.createElement("div");

toast.innerText = msg;

toast.style.position = "fixed";
toast.style.bottom = "20px";
toast.style.left = "50%";
toast.style.transform = "translateX(-50%)";
toast.style.background = "#5a67d8";
toast.style.color = "#fff";
toast.style.padding = "12px 18px";
toast.style.borderRadius = "8px";
toast.style.boxShadow = "0 6px 20px rgba(0,0,0,.2)";
toast.style.zIndex = "9999";

document.body.appendChild(toast);

setTimeout(()=>{
toast.remove();
},4000);

}