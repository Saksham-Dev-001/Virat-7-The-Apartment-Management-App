import { auth, db } from "./firebase.js";

import {
collection,
query,
where,
onSnapshot,
doc,
getDoc
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


const list = document.getElementById("paymentList");
const totalBox = document.getElementById("totalPaid");



/* ================= AUTH ================= */

onAuthStateChanged(auth, async (user)=>{

if(!user){

list.innerHTML = "Login required";
return;

}

try{

const userSnap = await getDoc(doc(db,"users",user.uid));

if(!userSnap.exists()) return;

const userFlat = userSnap.data().flat;

if(!userFlat) return;

loadPayments(userFlat);

}catch(err){

console.error(err);

}

});



/* ================= LOAD ================= */

function loadPayments(flat){

const q = query(
collection(db,"dues"),
where("flat","==",flat)
);

onSnapshot(q,(snap)=>{

list.innerHTML = "";

let total = 0;
let html = [];


/* ===== EMPTY ===== */

if(snap.empty){

totalBox.innerText = "Total Paid ₹0";
list.innerHTML = emptyHtml();
return;

}


/* ===== LOOP ===== */

snap.forEach(docSnap=>{

const d = docSnap.data();

if(d.status !== "paid") return;

const amount = Number(d.amount || 0);

total += amount;


/* ===== DATE ===== */

let date = "";

if(d.approvedAt){

try{

const t = d.approvedAt.toDate();

date =
t.toLocaleDateString() +
" • " +
t.toLocaleTimeString([],{
hour:"2-digit",
minute:"2-digit"
});

}catch{}

}


/* ===== RECEIPT ===== */

const receipt =
d.receiptNo
? `<div class="sub">Receipt: ${d.receiptNo}</div>`
: "";


/* ===== CARD ===== */

html.push(`

<div class="card">

<div class="row">

<div>

<div class="amount">
₹ ${amount}
</div>

<div class="sub">
${d.type || ""} • ${d.month || ""}
</div>

<div class="sub">
Flat ${d.flat || ""}
</div>

${receipt}

${date ? `<div class="sub">${date}</div>` : ""}

<button
onclick="downloadReceipt(
'${amount}',
'${d.flat}',
'${d.type}',
'${d.month}',
'${d.receiptNo || ""}',
'${date}'
)"
style="
margin-top:6px;
padding:6px 10px;
border:none;
border-radius:6px;
background:#5a67d8;
color:white;
cursor:pointer;
">

Download Receipt

</button>

</div>

<div class="badge paid">
Paid
</div>

</div>

</div>

`);

});


/* ===== SHOW ===== */

if(total > 0){

totalBox.innerText = "Total Paid ₹ " + total;

list.innerHTML = html.reverse().join("");

}else{

totalBox.innerText = "Total Paid ₹0";

list.innerHTML = emptyHtml();

}

});

}



/* ================= EMPTY ================= */

function emptyHtml(){

return `

<div class="empty">

<i class="fa-solid fa-wallet"></i>

<p>No payments yet</p>

</div>

`;

}



/* ================= PDF ================= */

window.downloadReceipt = function(
amount,
flat,
type,
month,
receipt,
date
){

const { jsPDF } = window.jspdf;

const doc = new jsPDF();


const now = new Date();

const fullDate =
now.toLocaleDateString() +
" " +
now.toLocaleTimeString([],{
hour:"2-digit",
minute:"2-digit"
});


const logo = new Image();

logo.src = "../assets/logo.png";


logo.onload = function(){

doc.setFillColor(90,103,216);
doc.rect(0,0,210,25,"F");

doc.addImage(logo,"PNG",10,5,15,15);

doc.setTextColor(255,255,255);
doc.setFontSize(16);
doc.text("VIRAT-7 Society",30,14);

doc.setFontSize(10);
doc.text(
"Virat 7, Jaipur",
30,
20
);

doc.setTextColor(0,0,0);

doc.setFontSize(14);
doc.text("Payment Receipt",20,40);

doc.line(20,43,190,43);

doc.setFontSize(12);

doc.text("Receipt No:",20,55);
doc.text(String(receipt || "-"),70,55);

doc.text("Flat:",20,65);
doc.text(String(flat || "-"),70,65);

doc.text("Amount:",20,75);
doc.text("₹ " + Number(amount),70,75);

doc.text("Type:",20,85);
doc.text(String(type || "-"),70,85);

doc.text("Month:",20,95);
doc.text(String(month || "-"),70,95);

doc.text("Date:",20,105);
doc.text(fullDate,70,105);

doc.text("Status:",20,115);
doc.text("Paid",70,115);

doc.setTextColor(200,0,0);
doc.setFontSize(18);
doc.text("PAID",140,90,{angle:20});

doc.save("receipt-" + receipt + ".pdf");

};

};