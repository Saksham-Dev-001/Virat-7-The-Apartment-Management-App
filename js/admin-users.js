import { db } from "./firebase.js";

import {
collection,
getDocs,
updateDoc,
doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


let users = [];

let pendingFlatUser = null
let pendingRoleChange = null

let pendingEditUser = null
let pendingEditField = null



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

list.forEach((u,i)=>{

const avatar =
u.name ? u.name.charAt(0).toUpperCase() : "U";

const passId = "pass_"+i;

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

<button
class="edit-btn"
onclick="openEdit('${u.id}','name','${u.name||""}')"
>
Edit
</button>

</div>


<div class="user-email">
${u.email || ""}
</div>


<div class="user-flat">

Phone ${u.phone || "-"}

<button
class="edit-btn"
onclick="openEdit('${u.id}','phone','${u.phone||""}')"
>
Edit
</button>

</div>


<div class="user-pass">

Password:

<span
class="pass-text"
id="${passId}"
data-pass="${u.password || ""}"
data-show="0"
>
••••••
</span>

<i
class="fa-solid fa-eye eye-btn"
onclick="togglePass('${passId}')"
></i>

</div>


<div class="user-flat">

Flat ${u.flat || "-"}

<button
class="flat-btn"
onclick="openFlat('${u.id}')"
>
Edit
</button>

</div>


<select
class="role-select"
onchange="changeRole('${u.id}',this.value)"
>

<option value="resident"
${u.role==="resident"?"selected":""}>
Resident
</option>

<option value="admin"
${u.role==="admin"?"selected":""}>
Admin
</option>

</select>

</div>

`;

});

}



/* ROLE CHANGE */

window.changeRole = function(id,role){

const user = users.find(u=>u.id===id)

pendingRoleChange = { id, role, name:user?.name }

showConfirm(
"Change Role",
`Change role of ${user?.name || "user"} to ${role}?`
)

}


function showConfirm(title,text){

confirmTitle.innerText = title
confirmText.innerText = text

confirmBox.classList.add("show")

}


window.closeConfirm = function(){

confirmBox.classList.remove("show")
pendingRoleChange = null

}


window.confirmYes = async function(){

if(!pendingRoleChange) return

await updateDoc(
doc(db,"users",pendingRoleChange.id),
{ role: pendingRoleChange.role }
)

closeConfirm()
loadUsers()

}



/* FLAT */

window.openFlat = function(id){

const user = users.find(u=>u.id===id)

pendingFlatUser = id

flatInput.value = user?.flat || ""

flatBox.classList.add("show")

}


window.closeFlat = function(){

flatBox.classList.remove("show")
pendingFlatUser = null

}


window.saveFlat = async function(){

if(!pendingFlatUser) return

await updateDoc(
doc(db,"users",pendingFlatUser),
{
flat: flatInput.value.trim()
})

closeFlat()
loadUsers()

}



/* ================= EDIT POPUP ================= */

window.openEdit = function(id,field,value){

pendingEditUser = id
pendingEditField = field

editTitle.innerText = "Edit " + field

editError.style.display = "none"


// show phone UI

if(field === "phone"){

phoneBox.style.display = "flex"
editInput.style.display = "none"

value = value.replace("+91","")

editInputPhone.value = value || ""

}else{

phoneBox.style.display = "none"
editInput.style.display = "block"

editInput.value = value || ""

}

editBox.classList.add("show")

}


window.closeEdit = function(){

editBox.classList.remove("show")

pendingEditUser = null
pendingEditField = null

}


window.saveEdit = async function(){

if(!pendingEditUser) return

let value = ""


// PHONE

if(pendingEditField === "phone"){

value = editInputPhone.value.trim()

if(!/^[0-9]{10}$/.test(value)){

editError.innerText = "Enter 10 digit number"
editError.style.display = "block"

return

}

value = "+91" + value

}


// NAME

else{

value = editInput.value.trim()

if(value === "") return

}


await updateDoc(
doc(db,"users",pendingEditUser),
{
[pendingEditField]: value
})

closeEdit()
loadUsers()

}



/* FILTER */

window.filterUsers = function(){

const search =
document.getElementById("userSearch")
.value.toLowerCase();

const role =
document.getElementById("roleFilter").value;

let filtered = users.filter(u =>

(u.name?.toLowerCase().includes(search) ||
u.email?.toLowerCase().includes(search))

);

if(role !== "all"){

filtered =
filtered.filter(u => u.role === role);

}

renderUsers(filtered);

};



loadUsers();