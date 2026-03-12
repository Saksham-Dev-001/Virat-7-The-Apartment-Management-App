import { db } from "./firebase.js";

import {
collection,
getDocs,
updateDoc,
doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let users = [];


/* LOAD USERS */

async function loadUsers(){

const snapshot = await getDocs(collection(db,"users"));

users = [];

snapshot.forEach(d=>{
users.push({
id:d.id,
...d.data()
});
});

renderUsers(users);

}


/* RENDER USERS */

function renderUsers(list){

const container = document.getElementById("userList");

if(!container) return;

container.innerHTML = "";

if(list.length === 0){

container.innerHTML = `
<div style="text-align:center;color:#777;padding:40px">
<i class="fa-solid fa-users"></i>
<p>No users found</p>
</div>
`;

return;
}

list.forEach(u=>{

const avatar = u.name ? u.name.charAt(0).toUpperCase() : "U";

container.innerHTML += `

<div class="user-card">

<div class="role-badge role-${u.role}">
${u.role}
</div>

<div class="user-avatar">
${avatar}
</div>

<div class="user-name">
${u.name || "User"}
</div>

<div class="user-email">
${u.email || ""}
</div>

<div class="user-flat">
Flat ${u.flat || "-"}
</div>

<select class="role-select"
onchange="changeRole('${u.id}',this.value)">

<option value="resident" ${u.role==="resident"?"selected":""}>
Resident
</option>

<option value="admin" ${u.role==="admin"?"selected":""}>
Admin
</option>

</select>

</div>

`;

});

}


/* CHANGE ROLE */

window.changeRole = async function(id,role){

try{

await updateDoc(doc(db,"users",id),{role});

users = users.map(u=>{
if(u.id===id) u.role=role;
return u;
});

renderUsers(users);

}catch(err){

console.error(err);
alert("Role update failed");

}

};


/* FILTER USERS */

window.filterUsers = function(){

const search = document.getElementById("userSearch").value.toLowerCase();

const role = document.getElementById("roleFilter").value;

let filtered = users.filter(u =>

(u.name?.toLowerCase().includes(search) ||
u.email?.toLowerCase().includes(search))

);

if(role !== "all"){

filtered = filtered.filter(u => u.role === role);

}

renderUsers(filtered);

};


/* START */

loadUsers();