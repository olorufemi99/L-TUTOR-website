// ======================================
// L-TUTOR
// ANNOUNCEMENTS v3.0
// PART 1
// ======================================

let editingAnnouncement=false;
let editingAnnouncementId=null;

function loadAnnouncementsModule(){

pageTitle.innerHTML="Announcements";

pageSubtitle.innerHTML="Create and manage announcements.";

contentArea.innerHTML=`

<div class="panel">

<h2>

<i class="fa-solid fa-bullhorn"></i>

Create Announcement

</h2>

<div class="form-grid">

<div class="form-group">

<label>Announcement Title</label>

<input
type="text"
id="announcementTitle"
placeholder="Mid-Semester Examination">

</div>

<div class="form-group">

<label>Priority</label>

<select id="announcementPriority">

<option>Normal</option>

<option>Important</option>

<option>Urgent</option>

</select>

</div>

<div class="form-group">

<label>Announcement Message</label>

<textarea
id="announcementMessage"
placeholder="Write announcement here..."></textarea>

</div>

</div>

<button

class="save-btn"

id="saveAnnouncementBtn"

onclick="saveAnnouncement()">

<i class="fa-solid fa-floppy-disk"></i>

Publish Announcement

</button>

</div>

<div class="panel">

<h2>

<i class="fa-solid fa-list"></i>

Published Announcements

</h2>

<div class="search-box">

<i class="fa-solid fa-magnifying-glass"></i>

<input

type="text"

id="announcementSearch"

placeholder="Search Announcement..."

onkeyup="searchAnnouncements()">

</div>

<table>

<thead>

<tr>

<th>Title</th>

<th>Priority</th>

<th>Date</th>

<th>Actions</th>

</tr>

</thead>

<tbody id="announcementTable">

<tr>

<td colspan="4">

Loading...

</td>

</tr>

</tbody>

</table>

</div>

`;

loadAnnouncements();

}
// ======================================
// LOAD ANNOUNCEMENTS
// ======================================

function loadAnnouncements(){

const table=document.getElementById("announcementTable");

table.innerHTML="";

announcementsRef

.orderBy("createdAt","desc")

.get()

.then(function(snapshot){

if(snapshot.empty){

table.innerHTML=`

<tr>

<td colspan="4">

No Announcements.

</td>

</tr>

`;

return;

}

snapshot.forEach(function(doc){

const a=doc.data();

table.innerHTML+=`

<tr>

<td>${a.title}</td>

<td>${a.priority}</td>

<td>

${a.createdAt?

new Date(a.createdAt.seconds*1000)

.toLocaleDateString()

:

"--"}

</td>

<td>

<button

class="edit-btn"

onclick="editAnnouncement('${doc.id}')">

Edit

</button>

<button

class="delete-btn"

onclick="deleteAnnouncement('${doc.id}')">

Delete

</button>

</td>

</tr>

`;

});

});

}
// ======================================
// SAVE ANNOUNCEMENT
// ======================================

async function saveAnnouncement(){

try{

const announcement={

title:announcementTitle.value.trim(),

priority:announcementPriority.value,

message:announcementMessage.value.trim(),

updatedAt:firebase.firestore.FieldValue.serverTimestamp()

};

if(

announcement.title==""||

announcement.message==""

){

showWarning("Please complete all required fields.");

return;

}

if(editingAnnouncement){

await announcementsRef

.doc(editingAnnouncementId)

.update(announcement);

showSuccess("Announcement Updated Successfully.");

editingAnnouncement=false;

editingAnnouncementId=null;

document.getElementById("saveAnnouncementBtn").innerHTML=

'<i class="fa-solid fa-floppy-disk"></i> Publish Announcement';

}else{

announcement.createdAt=

firebase.firestore.FieldValue.serverTimestamp();

await announcementsRef.add(announcement);

showSuccess("Announcement Published Successfully.");

}

announcementTitle.value="";
announcementMessage.value="";
announcementPriority.value="Normal";

loadAnnouncements();

}catch(error){

showError(error.message);

}

}
// ======================================
// EDIT ANNOUNCEMENT
// ======================================

function editAnnouncement(id){

announcementsRef

.doc(id)

.get()

.then(function(doc){

const a=doc.data();

editingAnnouncement=true;

editingAnnouncementId=id;

announcementTitle.value=a.title;

announcementPriority.value=a.priority;

announcementMessage.value=a.message;

document.getElementById("saveAnnouncementBtn").innerHTML=

'<i class="fa-solid fa-pen"></i> Update Announcement';

showSuccess("Announcement loaded for editing.");

});

}

// ======================================
// DELETE ANNOUNCEMENT
// ======================================

function deleteAnnouncement(id){

showConfirm(

"Delete Announcement",

"Delete this announcement?"

)

.then((result)=>{

if(!result.isConfirmed) return;

announcementsRef

.doc(id)

.delete()

.then(function(){

showSuccess("Announcement Deleted Successfully.");

loadAnnouncements();

});

});

}

// ======================================
// SEARCH ANNOUNCEMENTS
// ======================================

function searchAnnouncements(){

const search=document

.getElementById("announcementSearch")

.value

.toUpperCase();

const rows=document

.querySelectorAll("#announcementTable tr");

rows.forEach(function(row){

const text=row.innerText.toUpperCase();

row.style.display=

text.includes(search)

?

""

:

"none";

});

}
