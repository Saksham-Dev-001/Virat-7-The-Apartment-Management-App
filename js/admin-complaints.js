import { db } from "./firebase.js";

import {
collection,
query,
orderBy,
onSnapshot,
updateDoc,
doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const container=document.getElementById("adminComplaintList");

const q=query(
collection(db,"complaints"),
orderBy("createdAt","desc")
);

onSnapshot(q,(snapshot)=>{

container.innerHTML="";

snapshot.forEach(d=>{

const data=d.data();

container.innerHTML+=`

<div class="card">

<strong>${data.title}</strong>

<p>${data.message}</p>

<p>Flat ${data.flat}</p>

<select class="status-select"
onchange="updateStatus('${d.id}',this.value)">

<option value="open" ${data.status==="open"?"selected":""}>
Open
</option>

<option value="in-progress" ${data.status==="in-progress"?"selected":""}>
In Progress
</option>

<option value="resolved" ${data.status==="resolved"?"selected":""}>
Resolved
</option>

</select>

</div>

`;

});

});

window.updateStatus=async function(id,status){

await updateDoc(doc(db,"complaints",id),{
status:status
});

};