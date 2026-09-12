// ======================================
// L-TUTOR
// LECTURERS MODULE
// ======================================

function loadLecturersModule(){

pageTitle.innerHTML = "Lecturers";

pageSubtitle.innerHTML =
"Manage academic staff profiles.";

contentArea.innerHTML = `

<div class="panel">

<h2>Add New Lecturer</h2>

<div class="form-grid">

<div class="form-group">

<label>Lecturer Photo</label>

<label class="upload-box">

<input

type="file"

id="lecturerPhotoFile"

accept="image/*"

onchange="previewImage(this,'lecturerPhotoPreview')">

<i class="fa-solid fa-cloud-arrow-up"></i>

<h4>Upload Lecturer Photo</h4>

<p>Click to choose an image</p>

</label>

<div

id="lecturerPhotoPreview"

class="upload-preview">

</div>

</div>

<div class="form-group">
<label>Full Name</label>
<input
type="text"
id="lecturerName"
placeholder="Dr. Raheem A. A. Okewale">
</div>

<div class="form-group">
<label>Academic Rank</label>
<input
type="text"
id="lecturerRank"
placeholder="Senior Lecturer">
</div>

<div class="form-group">
<label>Administrative Position</label>
<input
type="text"
id="lecturerPosition"
placeholder="Head of Department">
</div>

<div class="form-group">
<label>Department</label>
<input
type="text"
id="lecturerDepartment"
placeholder="Local Government Administration and Development Studies">
</div>

<div class="form-group">
<label>Faculty</label>
<input
type="text"
id="lecturerFaculty"
placeholder="Faculty of Management Sciences">
</div>

<div class="form-group">

<label>Official Email</label>

<input
type="email"
id="lecturerEmail"
placeholder="example@lasu.edu.ng">

</div>

<div class="form-group">

<label>WhatsApp Number</label>

<input
type="text"
id="lecturerWhatsapp"
placeholder="2348012345678">

</div>

<div class="form-group">
<label>Biography</label>
<textarea
id="lecturerBio"
placeholder="Write lecturer biography..."></textarea>
</div>

<div class="form-group">
<label>Qualifications</label>
<textarea
id="lecturerQualifications"
placeholder="Ph.D...&#10;M.Sc...&#10;B.Sc..."></textarea>
</div>

<div class="form-group">
<label>Courses Taught</label>
<textarea
id="lecturerCourses"
placeholder="LGD 314&#10;LGD 322"></textarea>
</div>

<div class="form-group">
<label>Research Interests</label>
<textarea
id="lecturerResearch"
placeholder="Public Administration, Governance..."></textarea>
</div>

</div>

<button
class="save-btn"
onclick="saveLecturer()">

<i class="fa-solid fa-user-plus"></i>

Save Lecturer

</button>

</div>

<div class="panel">

<h2>Academic Staff</h2>

<table>

<thead>

<tr>

<th>Name</th>

<th>Rank</th>

<th>Position</th>

<th>Action</th>

</tr>

</thead>

<tbody id="lecturerTable">

<tr>

<td colspan="4">

Loading lecturers...

</td>

</tr>

</tbody>

</table>

</div>

`;

loadLecturers();

}
// ======================================
// SAVE LECTURER
// ======================================

function saveLecturer(){

const lecturer={

photo:document.getElementById("lecturerPhoto").value.trim(),

name:document.getElementById("lecturerName").value.trim(),

rank:document.getElementById("lecturerRank").value.trim(),

position:document.getElementById("lecturerPosition").value.trim(),

department:document.getElementById("lecturerDepartment").value.trim(),

faculty:document.getElementById("lecturerFaculty").value.trim(),

email:document.getElementById("lecturerEmail").value.trim(),
  
whatsapp:document.getElementById("lecturerWhatsapp").value.trim(),
  
biography:document.getElementById("lecturerBio").value.trim(),

qualifications:document.getElementById("lecturerQualifications").value.trim(),

courses:document.getElementById("lecturerCourses").value.trim(),

research:document.getElementById("lecturerResearch").value.trim(),

createdAt:firebase.firestore.FieldValue.serverTimestamp()

};

if(

lecturer.name=="" ||

lecturer.rank=="" ||

lecturer.department==""

){

showWarning("Please complete all required fields.");

return;

}

db.collection("lecturers")

.add(lecturer)

.then(function(){

alert("Lecturer added successfully.");

loadLecturers();

document.querySelectorAll(".form-grid input,.form-grid textarea")

.forEach(function(field){

field.value="";

});

});

}
// ======================================
// LOAD LECTURERS
// ======================================

function loadLecturers(){

const table=document.getElementById("lecturerTable");

if(!table) return;

table.innerHTML="";

db.collection("lecturers")

.orderBy("name")

.get()

.then(function(snapshot){

if(snapshot.empty){

table.innerHTML=

"<tr><td colspan='4'>No lecturers added.</td></tr>";

return;

}

snapshot.forEach(function(doc){

const lecturer=doc.data();

table.innerHTML+=`

<tr>

<td>${lecturer.name}</td>

<td>${lecturer.rank}</td>

<td>${lecturer.position||"--"}</td>

<td>

<button
class="delete-btn"
onclick="deleteLecturer('${doc.id}')">

Delete

</button>

</td>

</tr>

`;

});

});

}
// ======================================
// DELETE LECTURER
// ======================================

function deleteLecturer(id){

if(!confirm("Delete this lecturer?")) return;

db.collection("lecturers")

.doc(id)

.delete()

.then(function(){

loadLecturers();

});

}