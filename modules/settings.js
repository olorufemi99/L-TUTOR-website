// ======================================
// L-TUTOR SETTINGS v2.0
// PART 1
// ======================================

function loadSettingsModule(){

pageTitle.innerHTML="Settings";

pageSubtitle.innerHTML="Manage L-TUTOR system settings.";

contentArea.innerHTML=`

<div class="panel">

<h2>Department Information</h2>

<div class="form-grid">

<div class="form-group">

<label>Department Name</label>

<input
type="text"
id="departmentName"
placeholder="Department of Local Government Administration and Development Studies">

</div>

<div class="form-group">

<label>Faculty</label>

<input
type="text"
id="facultyName"
placeholder="Faculty of Management Sciences">

</div>

<div class="form-group">

<label>University</label>

<input
type="text"
id="universityName"
placeholder="Lagos State University">

</div>

<div class="form-group">

<label>Department Email</label>

<input
type="email"
id="departmentEmail"
placeholder="department@email.com">

</div>

<div class="form-group">

<label>Department Phone</label>

<input
type="text"
id="departmentPhone"
placeholder="+234...">

</div>

<div class="form-group">

<label>Department Logo URL</label>

<input
type="text"
id="departmentLogo"
placeholder="images/logo.png">

</div>

</div>

<button
class="save-btn"
onclick="saveSettings()">

<i class="fa-solid fa-floppy-disk"></i>

Save Settings

</button>

</div>

<div class="panel">

<h2>Academic Session</h2>

<div class="form-grid">

<div class="form-group">

<label>Current Session</label>

<input
type="text"
id="currentSession"
placeholder="2026/2027">

</div>

<div class="form-group">

<label>Current Semester</label>

<select id="currentSemester">

<option>First Semester</option>

<option>Second Semester</option>

</select>

</div>

</div>

</div>

`;

loadSettings();

}
// ======================================
// SETTINGS v2.0
// PART 2
// ======================================

contentArea.innerHTML += `

<div class="panel">

<h2>Homepage Settings</h2>

<div class="form-grid">

<div class="form-group">

<label>Hero Title</label>

<input
type="text"
id="heroTitle"
placeholder="Learn Smarter with L-TUTOR">

</div>

<div class="form-group">

<label>Hero Subtitle</label>

<input
type="text"
id="heroSubtitle"
placeholder="Departmental Learning Management Portal">

</div>

<div class="form-group">

<label>Welcome Message</label>

<textarea
id="welcomeMessage"
placeholder="Welcome to L-TUTOR..."></textarea>

</div>

<div class="form-group">

<label>Footer Text</label>

<input
type="text"
id="footerText"
placeholder="© L-TUTOR 2026">

</div>

</div>

</div>

<div class="panel">

<h2>Administrator Profile</h2>

<div class="form-grid">

<div class="form-group">

<label>Administrator Name</label>

<input
type="text"
id="adminName"
placeholder="Administrator">

</div>

<div class="form-group">

<label>Administrator Email</label>

<input
type="email"
id="adminEmail"
placeholder="admin@ltutor.com">

</div>

<div class="form-group">

<label>Profile Photo URL</label>

<input
type="text"
id="adminPhoto"
placeholder="images/admin.png">

</div>

</div>

</div>

<div class="panel">

<h2>System Statistics</h2>

<div class="stats">

<div class="card">

<h2 id="settingsStudentCount">0</h2>

<p>Students</p>

</div>

<div class="card">

<h2 id="settingsCourseCount">0</h2>

<p>Courses</p>

</div>

<div class="card">

<h2 id="settingsLecturerCount">0</h2>

<p>Lecturers</p>

</div>

<div class="card">

<h2 id="settingsAnnouncementCount">0</h2>

<p>Announcements</p>

</div>

</div>

</div>

`;

loadStatistics();
// ======================================
// SETTINGS v2.0
// PART 3
// ======================================

function loadSettings(){

db.collection("settings")

.doc("system")

.get()

.then(function(doc){

if(!doc.exists) return;

const s=doc.data();

departmentName.value=s.departmentName||"";

facultyName.value=s.facultyName||"";

universityName.value=s.universityName||"";

departmentEmail.value=s.departmentEmail||"";

departmentPhone.value=s.departmentPhone||"";

departmentLogo.value=s.departmentLogo||"";

currentSession.value=s.currentSession||"";

currentSemester.value=s.currentSemester||"First Semester";

heroTitle.value=s.heroTitle||"";

heroSubtitle.value=s.heroSubtitle||"";

welcomeMessage.value=s.welcomeMessage||"";

footerText.value=s.footerText||"";

adminName.value=s.adminName||"";

adminEmail.value=s.adminEmail||"";

adminPhoto.value=s.adminPhoto||"";

});

}

function saveSettings(){

const settings={

departmentName:departmentName.value.trim(),

facultyName:facultyName.value.trim(),

universityName:universityName.value.trim(),

departmentEmail:departmentEmail.value.trim(),

departmentPhone:departmentPhone.value.trim(),

departmentLogo:departmentLogo.value.trim(),

currentSession:currentSession.value.trim(),

currentSemester:currentSemester.value,

heroTitle:heroTitle.value.trim(),

heroSubtitle:heroSubtitle.value.trim(),

welcomeMessage:welcomeMessage.value.trim(),

footerText:footerText.value.trim(),

adminName:adminName.value.trim(),

adminEmail:adminEmail.value.trim(),

adminPhoto:adminPhoto.value.trim(),

updatedAt:firebase.firestore.FieldValue.serverTimestamp()

};

db.collection("settings")

.doc("system")

.set(settings)

.then(function(){

showSuccess("Settings saved successfully.");

})

.catch(function(error){

showError(error.message);

});

}
// ======================================
// SETTINGS v2.0
// PART 4
// ======================================

function loadStatistics(){

db.collection("students")
.get()
.then(function(snapshot){

const el=document.getElementById("settingsStudentCount");

if(el) el.innerHTML=snapshot.size;

});

db.collection("courses")
.get()
.then(function(snapshot){

const el=document.getElementById("settingsCourseCount");

if(el) el.innerHTML=snapshot.size;

});

db.collection("lecturers")
.get()
.then(function(snapshot){

const el=document.getElementById("settingsLecturerCount");

if(el) el.innerHTML=snapshot.size;

});

db.collection("announcements")
.get()
.then(function(snapshot){

const el=document.getElementById("settingsAnnouncementCount");

if(el) el.innerHTML=snapshot.size;

});

}

// ======================================
// DANGER ZONE
// ======================================

contentArea.innerHTML += `

<div class="panel">

<h2 style="color:#e53935;">

<i class="fa-solid fa-triangle-exclamation"></i>

Danger Zone

</h2>

<p>

These actions are irreversible.

</p>

<button
class="delete-btn"
onclick="resetSystem()">

Reset System

</button>

</div>

`;

function resetSystem(){

showConfirm(

"Reset System",

"This will remove ALL announcements. Continue?"

)

.then((result)=>{

if(!result.isConfirmed) return;

db.collection("announcements")

.get()

.then(function(snapshot){

const batch=db.batch();

snapshot.forEach(function(doc){

batch.delete(doc.ref);

});

return batch.commit();

})

.then(function(){

showSuccess("System reset completed.");

loadSettingsModule();

})

.catch(function(error){

showError(error.message);

});

});

}
