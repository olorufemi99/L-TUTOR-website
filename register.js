// ======================================
// L-TUTOR STUDENT REGISTRATION v2.0
// Part 1
// ======================================

const registerForm = document.getElementById("registerForm");

const passportInput = document.getElementById("passport");
const passportPreview = document.getElementById("passportPreview");
const previewImage = document.getElementById("previewImage");

const fullnameInput = document.getElementById("fullname");
const matricInput = document.getElementById("matric");
const levelInput = document.getElementById("level");
const entryModeInput = document.getElementById("entryMode");

const previewName = document.getElementById("previewName");
const previewMatric = document.getElementById("previewMatric");
const previewLevel = document.getElementById("previewLevel");

// ======================================
// LIVE PREVIEW
// ======================================

fullnameInput.addEventListener("input",function(){

previewName.innerHTML =
this.value || "Your Name";

});

matricInput.addEventListener("input",function(){

previewMatric.innerHTML =
this.value || "Matric Number";

if(this.value.length>=6){

const code=this.value.substring(3,6);

if(code==="833"){

document.getElementById("department").value =
"Local Government Administration and Development Studies";

document.getElementById("faculty").value =
"Faculty of Management Sciences";

}else{

document.getElementById("department").value =
"Unknown Department";

document.getElementById("faculty").value =
"Unknown Faculty";

}

}

});

levelInput.addEventListener("change",function(){

previewLevel.innerHTML =

this.value
? this.value+" Level"
: "Level";

});

// ======================================
// PASSPORT PREVIEW
// ======================================

passportInput.addEventListener("change",function(){

const file=this.files[0];

if(file){

const reader=new FileReader();

reader.onload=function(e){

passportPreview.src=e.target.result;

if(previewImage){

previewImage.src=e.target.result;

}

}

reader.readAsDataURL(file);

}

});

// ======================================
// SHOW / HIDE PASSWORD
// ======================================

function togglePassword(id,icon){

const input=document.getElementById(id);

if(input.type==="password"){

input.type="text";

icon.classList.replace("fa-eye","fa-eye-slash");

}else{

input.type="password";

icon.classList.replace("fa-eye-slash","fa-eye");

}

}
// ======================================
// REGISTER STUDENT
// Part 2
// ======================================

registerForm.addEventListener("submit",registerStudent);

function registerStudent(e){

e.preventDefault();

const fullname=fullnameInput.value.trim();

const matric=matricInput.value.trim();

const email=document.getElementById("email").value.trim();

const phone=document.getElementById("phone").value.trim();

const entryMode=entryModeInput.value;

const level=levelInput.value;

const department=document.getElementById("department").value;

const faculty=document.getElementById("faculty").value;

const password=document.getElementById("password").value;

const confirmPassword=document.getElementById("confirmPassword").value;

// =========================
// VALIDATION
// =========================

if(fullname===""){

showError("Please enter your full name.");

return;

}

if(matric.length!==9){

showError("Matric number must contain exactly 9 digits.");

return;

}

if(matric.substring(3,6)!=="833"){

showWarning("Only Local Government students can register.");

return;

}

if(entryMode===""){

showWarning("Please select your mode of entry.");

return;

}

if(level===""){

showWarning("Please select your current level.");

return;

}

// IMPORTANT:
// Mode of entry does NOT determine the student's current level.
// A student can enter through UTME and later be in 200/300/400 Level,
// so the selected current level must be accepted independently.

if(
    !["100","200","300","400","500"].includes(level)
){

showWarning("Please select your current level.");

return;

}

if(password.length<6){

showWarning("Password must contain at least 6 characters.");

return;

}

if(password!==confirmPassword){

showError("Passwords do not match.");

return;

}

// =========================
// LOADING POPUP
// =========================

Swal.fire({

title:"Creating Account...",

text:"Please wait...",

allowOutsideClick:false,

allowEscapeKey:false,

didOpen:()=>{

Swal.showLoading();

}

});

// =========================
// CHECK DUPLICATE MATRIC
// A small public registry prevents a full
// student-directory read during registration.
// =========================

db.collection("matricRegistry")
.doc(matric)
.get()

.then(function(registryDoc){

if(registryDoc.exists){

Swal.close();

showError("This matric number has already been registered.");

return Promise.reject("duplicate");

}

return auth.createUserWithEmailAndPassword(
email,
password
);

})
.then(async function(userCredential){

const user = userCredential.user;

await db.collection("students")
.doc(user.uid)
.set({

fullname:fullname,

matricNumber:matric,

email:email,

phone:phone,

modeOfEntry:entryMode,

level:level,

department:department,

faculty:faculty,

passport:"images/default-user.png",

status:"Active",

isAdmin:false,

role:"student",

createdAt:firebase.firestore.FieldValue.serverTimestamp()

});

await db.collection("matricRegistry")
.doc(matric)
.set({

uid:user.uid,

createdAt:firebase.firestore.FieldValue.serverTimestamp()

});

})
.then(function(){

Swal.close();

showSuccess("Registration Successful!");

setTimeout(function(){

window.location.href="dashboard.html";

},1500);

})

.catch(function(error){

Swal.close();

if(error==="duplicate") return;

let message="Registration failed.";

switch(error.code){

case "auth/email-already-in-use":
message="This email address is already registered.";
break;

case "auth/invalid-email":
message="Please enter a valid email address.";
break;

case "auth/weak-password":
message="Password is too weak.";
break;

case "auth/network-request-failed":
message="No internet connection.";
break;

default:
message=error.message;

}

showError(message);

});

}

// ======================================
// INPUT ANIMATION
// ======================================

const inputs=document.querySelectorAll("input,select");

inputs.forEach(function(input){

input.addEventListener("focus",function(){

if(this.parentElement){

this.parentElement.style.transform="scale(1.02)";
this.parentElement.style.transition=".25s";

}

});

input.addEventListener("blur",function(){

if(this.parentElement){

this.parentElement.style.transform="scale(1)";

}

});

});