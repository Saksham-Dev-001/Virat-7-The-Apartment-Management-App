import { loadUserData } from "./user-data.js";

loadUserData((user)=>{

document.getElementById("userName").innerText = user.name;

document.getElementById("pEmail").innerText = user.email;

document.getElementById("pFlat").innerText = user.flat;

document.getElementById("pPhone").innerText = user.phone;

document.getElementById("pRole").innerText = user.role;

document.getElementById("avatar").innerText =
user.name[0].toUpperCase();

});