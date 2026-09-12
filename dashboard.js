// ======================================
// L-TUTOR STUDENT DASHBOARD
// ======================================

auth.onAuthStateChanged(function(user){

if(!user){

window.location.href="login.html";
return;

}

// Welcome
const username=user.email.split("@")[0];

document.getElementById("welcome").innerHTML=
"Welcome, <strong>"+username.toUpperCase()+"</strong>";

// Load Dark Mode
db.collection("studentSettings")

.doc(user.uid)

.get()

.then(function(doc){

if(doc.exists){

applyTheme(doc.data().darkMode===true);

}

});

// Load Badges
loadNotificationBadges();

});

// ======================================
// LOGOUT
// ======================================

function logout(){

showConfirm(

"Logout",

"Are you sure you want to logout?"

).then((result)=>{

if(!result.isConfirmed) return;

auth.signOut().then(function(){

window.location.href="login.html";

});

});

}

// ======================================
// LOAD ALL BADGES
// ======================================

function loadNotificationBadges(){

loadBadge("courses","courseBadge");

loadBadge("lectureNotes","noteBadge");


loadBadge("videos","videoBadge");

loadBadge("books","bookBadge");

loadBadge("announcements","announcementBadge");

loadBadge("lecturers","staffBadge");

}

// ======================================
// LOAD ONE BADGE
// ======================================

function loadBadge(collection,badgeId){

const badge=document.getElementById(badgeId);

if(!badge) return;

const lastVisit=Number(
localStorage.getItem(collection+"LastVisit")||0
);

db.collection(collection)

.orderBy("uploadedAt","desc")

.get()

.then(function(snapshot){

let count=0;

snapshot.forEach(function(doc){

const data=doc.data();

if(

data.uploadedAt &&
data.uploadedAt.toMillis() > lastVisit

){

count++;

}

});

if(count>0){

badge.style.display="flex";
badge.innerHTML=count;

}else{

badge.style.display="none";

}

})

.catch(function(){

badge.style.display="none";

});

}

// ======================================
// CLEAR BADGE
// ======================================

function clearBadge(collection){

localStorage.setItem(

collection+"LastVisit",

Date.now()

);

loadNotificationBadges();

}