// ======================================
// L-TUTOR SETTINGS
// ======================================

auth.onAuthStateChanged(function(user){

if(!user){

window.location.href="login.html";
return;

}

loadUserSettings(user);

});

// ======================================
// LOAD SETTINGS
// ======================================

function loadUserSettings(user){

db.collection("studentSettings")
.doc(user.uid)
.get()
.then(function(doc){

if(!doc.exists) return;

const s=doc.data();

const dark=document.getElementById("darkMode");

if(dark){

dark.checked = s.darkMode || false;

if(dark.checked){

localStorage.setItem("theme","dark");

}else{

localStorage.setItem("theme","light");

}

applyTheme();

}

const announcement=document.getElementById("announcementToggle");

if(announcement){

announcement.checked=s.announcements!==false;

}

const email=document.getElementById("emailToggle");

if(email){

email.checked=s.emailNotifications!==false;

}

});

}

// ======================================
// SAVE SETTINGS
// ======================================

function saveSettings(){

const user=auth.currentUser;

if(!user) return;

const settings={

darkMode:
document.getElementById("darkMode").checked,

announcements:
document.getElementById("announcementToggle").checked,

emailNotifications:
document.getElementById("emailToggle").checked,

updatedAt:
firebase.firestore.FieldValue.serverTimestamp()

};

db.collection("studentSettings")
.doc(user.uid)
.set(settings,{merge:true})
.then(function(){

showSuccess("Settings Saved");

})
.catch(function(error){

showError(error.message);

});

}

// ======================================
// EVENTS
// ======================================

document.addEventListener("DOMContentLoaded",function(){

const dark=document.getElementById("darkMode");

if(dark){

dark.addEventListener("change", function(){

if(this.checked){

localStorage.setItem("theme","dark");

}else{

localStorage.setItem("theme","light");

}

applyTheme();

saveSettings();

});

}

const announcement=document.getElementById("announcementToggle");

if(announcement){

announcement.addEventListener("change",saveSettings);

}

const email=document.getElementById("emailToggle");

if(email){

email.addEventListener("change",saveSettings);

}

});

// ======================================
// PASSWORD
// ======================================

function changePassword(){

auth.sendPasswordResetEmail(auth.currentUser.email)
.then(function(){

showSuccess("Password reset email sent.");

})
.catch(function(error){

showError(error.message);

});

}

// ======================================
// EMAIL
// ======================================

function changeEmail(){

Swal.fire({

title:"Change Email",

input:"email",

showCancelButton:true

}).then((result)=>{

if(!result.isConfirmed) return;

auth.currentUser.updateEmail(result.value)
.then(function(){

showSuccess("Email Updated");

})
.catch(function(error){

showError(error.message);

});

});

}

// ======================================
// LOGOUT
// ======================================

function logout(){

auth.signOut().then(function(){

window.location.href="login.html";

});

}

// ======================================
// DELETE ACCOUNT
// ======================================

function deleteAccount(){

showConfirm(

"Delete Account",

"This cannot be undone."

).then((result)=>{

if(!result.isConfirmed) return;

auth.currentUser.delete()
.then(function(){

window.location.href="login.html";

});

});

}