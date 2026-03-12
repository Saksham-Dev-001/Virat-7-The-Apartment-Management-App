import { db } from "./firebase.js";

import {
collection,
onSnapshot,
doc,
updateDoc,
deleteDoc
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const list = document.getElementById("list");
const search = document.getElementById("search");
const filter = document.getElementById("statusFilter");

let dues = [];
let requests = [];


/* =====================
LOAD DUES
===================== */

onSnapshot(collection(db,"dues"),(snap)=>{

dues = [];

snap.forEach(d=>{

dues.push({
id:d.id,
...d.data()
});

});

render();

});


/* =====================
LOAD PAYMENT REQUESTS
===================== */

onSnapshot(collection(db,"payments"),(snap)=>{

requests = [];

snap.forEach(d=>{

const p = d.data();

/* show only pending */

if(p.status && p.status === "pending"){

requests.push({
id:d.id,
...p
});

}

});

render();

});



/* =====================
RENDER
===================== */

function render(){

list.innerHTML="";

const s = search.value.toLowerCase();
const f = filter.value;

let total = 0;



/* =====================
PAYMENT REQUESTS
===================== */

let reqHTML = "";

requests.forEach(p=>{

if(s && !p.flat?.toLowerCase().includes(s)) return;

reqHTML += `

<div class="card">

<div class="card-title">
Flat ${p.flat}
</div>

<div class="amount">
₹ ${p.amount}
</div>

${p.proof ? `
<img src="${p.proof}"
style="width:100%;border-radius:8px;margin-top:8px">

<div style="margin-top:6px;font-size:12px;word-break:break-all">

URL:
<a href="${p.proof}" target="_blank">
${p.proof}
</a>

</div>

<button
onclick="copyLink('${p.proof}')"
style="
margin-top:6px;
padding:6px 10px;
border:none;
border-radius:6px;
background:#eee;
cursor:pointer;
">

Copy URL

</button>

` : ""}

<div class="buttons">

<button class="btn-paid"
onclick="approve(
'${p.id}',
'${p.dueId}',
'${p.flat}',
'${p.amount}'
)"

>

Approve

</button>

<button class="btn-delete"
onclick="reject('${p.id}')">

Reject

</button>

</div>

</div>

`;

});


if(reqHTML){

list.innerHTML += `
<h3>Payment Requests (${requests.length})</h3>
${reqHTML}
`;

}



/* =====================
FILTER DUES
===================== */

let data = dues;

if(s){

data = data.filter(p=>
p.flat?.toLowerCase().includes(s)
);

}

if(f!="all"){

data = data.filter(p=>
(p.status || "pending") == f
);

}



/* =====================
TOTAL CALC
===================== */

data.forEach(p=>{

if(p.status==="paid"){

total += Number(p.amount || 0);

}

});


if(data.length){

list.innerHTML += `

<h3>Dues (${data.length})</h3>

<div class="card">

<div class="amount">
Total Paid ₹ ${total}
</div>

<div class="card-sub">
Collection summary
</div>

</div>

`;

}



/* =====================
DUES LIST
===================== */

data.forEach(p=>{

list.innerHTML+=`

<div class="card">

<div class="card-title">
Flat ${p.flat}
</div>

<div class="card-sub">
${p.type || "Maintenance"} • ${p.month}
</div>

<div class="amount">
₹ ${p.amount}
</div>

<div class="badges">

<span class="badge ${p.status || "pending"}">
${p.status || "pending"}
</span>

</div>

<div class="buttons">

<button class="btn-paid"
onclick="markPaid('${p.id}')">

Mark Paid

</button>

<button class="btn-delete"
onclick="deletePay('${p.id}')">

Delete

</button>

</div>

</div>

`;

});



if(!requests.length && !data.length){

list.innerHTML = "<p>No records</p>";

}

}



search.onkeyup = render;
filter.onchange = render;



/* =====================
APPROVE PAYMENT
===================== */

window.approve = async function(payId,dueId,flat,amount){

const receiptNo =
"RCPT-" + Date.now();

await updateDoc(
doc(db,"payments",payId),
{
status:"approved",
receiptNo: receiptNo,
approvedAt: new Date()
}
);

await updateDoc(
doc(db,"dues",dueId),
{
status:"paid",
receiptNo: receiptNo
}
);

alert("Payment Approved");

};




/* =====================
REJECT PAYMENT
===================== */

window.reject = async function(id){

await deleteDoc(
doc(db,"payments",id)
);

};




/* =====================
MARK PAID MANUAL
===================== */

window.markPaid = async function(id){

await updateDoc(
doc(db,"dues",id),
{status:"paid"}
);

};



/* =====================
DELETE
===================== */

window.deletePay = async function(id){

if(!confirm("Delete?")) return;

await deleteDoc(
doc(db,"dues",id)
);

};


window.copyLink = function(link){

navigator.clipboard.writeText(link);

alert("Copied");

};