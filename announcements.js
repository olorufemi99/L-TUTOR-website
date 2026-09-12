// ======================================
// L-TUTOR
// STUDENT ANNOUNCEMENTS
// ======================================

let allAnnouncements=[];

// ======================================
// LOAD ANNOUNCEMENTS
// ======================================

db.collection("announcements")

.orderBy("createdAt","desc")

.get()

.then(function(snapshot){

allAnnouncements=[];

snapshot.forEach(function(doc){

allAnnouncements.push({

id:doc.id,

...doc.data()

});

});

displayAnnouncements(allAnnouncements);

})

.catch(function(){

document.getElementById("announcementContainer").innerHTML=

'<div class="empty-announcement">No announcements available.</div>';

});

// ======================================
// DISPLAY
// ======================================

function displayAnnouncements(list){

const container=

document.getElementById("announcementContainer");

if(list.length===0){

container.innerHTML=

'<div class="empty-announcement">No announcements found.</div>';

return;

}

let html="";

list.forEach(function(item){

const date=

item.createdAt

?

new Date(

item.createdAt.seconds*1000

).toLocaleDateString()

:

"--";

html+=`

<div class="announcement-card">

<div class="announcement-header">

<h2 class="announcement-title">

${item.title}

</h2>

<span class="announcement-date">

${date}

</span>

</div>

<div class="announcement-body">

${item.message}

</div>

<div class="announcement-author">

L-TUTOR Administration

</div>

</div>

`;

});

container.innerHTML=html;

}

// ======================================
// SEARCH
// ======================================

function searchAnnouncements(){

const keyword=

document

.getElementById("searchAnnouncement")

.value

.toLowerCase();

const filtered=

allAnnouncements.filter(function(item){

return(

(item.title||"")

.toLowerCase()

.includes(keyword)

||

(item.message||"")

.toLowerCase()

.includes(keyword)

);

});

displayAnnouncements(filtered);

}