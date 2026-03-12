import { db } from "./firebase.js";
import { addActivity } from "../js/activity.js";

import {
collection,
onSnapshot
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const container=document.getElementById("paymentList");

onSnapshot(collection(db,"dues"),(snap)=>{

container.innerHTML="";

snap.forEach(doc=>{

const d=doc.data();

container.innerHTML+=`

<div class="admin-card">

<strong>Flat ${d.flat}</strong>

<p>${d.type}</p>

<p>${d.month}</p>

<p>₹${d.amount}</p>

<p>Status: ${d.status}</p>

</div>

`;

});

});