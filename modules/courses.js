// ======================================
// L-TUTOR v2.0
// COURSE MANAGEMENT MODULE
// Part 1 of 5
// ======================================

// Firebase Collection
const coursesRef = db.collection("courses");

// Edit Mode
let editingCourse = false;
let editingCourseId = null;

// ======================================
// LOAD COURSE MODULE
// ======================================

function loadCoursesModule(){

pageTitle.innerHTML="Courses";

pageSubtitle.innerHTML="Manage departmental courses.";

contentArea.innerHTML=`

<div class="panel">

<h2>

<i class="fa-solid fa-book"></i>

Course Information

</h2>

<div class="form-grid">

<div class="form-group">

<label>Course Code</label>

<input
type="text"
id="courseCode"
placeholder="LGD314">

</div>

<div class="form-group">

<label>Course Title</label>

<input
type="text"
id="courseTitle"
placeholder="Nigerian Local Government">

</div>

<div class="form-group">

<label>Level</label>

<select id="courseLevel">

<option value="">Select Level</option>

<option>100 Level</option>

<option>200 Level</option>

<option>300 Level</option>

<option>400 Level</option>

</select>

</div>

<div class="form-group">

<label>Semester</label>

<select id="courseSemester">

<option value="">Select Semester</option>

<option>First Semester</option>

<option>Second Semester</option>

</select>

</div>

<div class="form-group">

<label>Course Unit</label>

<select id="courseUnit">

<option value="">Select Unit</option>

<option>1</option>

<option>2</option>

<option>3</option>

<option>4</option>

<option>5</option>

</select>

</div>

<div class="form-group">

<label>Assigned Lecturer</label>

<input
type="text"
id="courseLecturer"
placeholder="Dr. R. A. Okewale">

</div>



<div class="form-group">

<label>Status</label>

<select id="courseStatus">

<option>Active</option>

<option>Hidden</option>

<option>Archived</option>

</select>

</div>

<option>Active</option>

<option>Hidden</option>

<option>Archived</option>

</select>

</div>

</div>

<button
class="save-btn"
id="saveCourseBtn">

<i class="fa-solid fa-floppy-disk"></i>

Save Course

</button>

</div>

<div class="panel">

<h2>

Registered Courses

</h2>

<div class="form-group">

<input
type="text"
id="courseSearch"
placeholder="Search Course...">

</div>

<table>

<thead>

<tr>

<th>Code</th>

<th>Title</th>

<th>Level</th>

<th>Semester</th>

<th>Units</th>

<th>Lecturer</th>

<th>Status</th>

<th>Actions</th>

</tr>

</thead>

<tbody id="courseTable">

<tr>

<td colspan="8">

Loading Courses...

</td>

</tr>

</tbody>

</table>

</div>

`;

document
.getElementById("saveCourseBtn")
.addEventListener("click",saveCourse);

document
.getElementById("courseSearch")
.addEventListener("keyup",searchCourses);

loadCourses();

}
// ======================================
// LOAD COURSES
// ======================================

function loadCourses(){

const table=document.getElementById("courseTable");

table.innerHTML="";

coursesRef

.orderBy("courseCode")

.get()

.then(function(snapshot){

if(snapshot.empty){

table.innerHTML=`

<tr>

<td colspan="8">

No Courses Added.

</td>

</tr>

`;

return;

}

snapshot.forEach(function(doc){

const c=doc.data();

table.innerHTML+=`

<tr>

<td>${c.courseCode}</td>

<td>${c.courseTitle}</td>

<td>${c.level}</td>

<td>${c.semester}</td>

<td>${c.unit || "-"}</td>

<td>${c.lecturer || "-"}</td>

<td>

<span class="status-badge ${String(c.status).toLowerCase()}">

${c.status || "Active"}

</span>

</td>

<td>

<button
class="edit-btn"
onclick="editCourse('${doc.id}')">

<i class="fa-solid fa-pen"></i>

</button>

<button
class="delete-btn"
onclick="deleteCourse('${doc.id}')">

<i class="fa-solid fa-trash"></i>

</button>

</td>

</tr>

`;

});

});

}

// ======================================
// SEARCH COURSES
// ======================================

function searchCourses(){

const keyword=document

.getElementById("courseSearch")

.value

.toUpperCase();

const rows=document

.querySelectorAll("#courseTable tr");

rows.forEach(function(row){

const text=row.innerText.toUpperCase();

row.style.display=

text.includes(keyword)

?

""

:

"none";

});

}

// ======================================
// EDIT COURSE
// ======================================

function editCourse(id){

coursesRef
.doc(id)
.get()
.then(function(doc){

if(!doc.exists){

showError("Course not found.");

return;

}

const c = doc.data();

editingCourse = true;
editingCourseId = id;

document.getElementById("courseCode").value = c.courseCode || "";
document.getElementById("courseTitle").value = c.courseTitle || "";
document.getElementById("courseLevel").value = c.level || "";
document.getElementById("courseSemester").value = c.semester || "";
document.getElementById("courseUnit").value = c.unit || "";
document.getElementById("courseLecturer").value = c.lecturer || "";
document.getElementById("courseStatus").value = c.status || "Active";

document.getElementById("saveCourseBtn").innerHTML =
'<i class="fa-solid fa-pen"></i> Update Course';

window.scrollTo({
top:0,
behavior:"smooth"
});

})
.catch(function(error){

showError(error.message);

});

}

// ======================================
// SAVE / UPDATE COURSE
// ======================================

function saveCourse(){

const code=document.getElementById("courseCode").value.trim().toUpperCase();

const title=document.getElementById("courseTitle").value.trim();

const level=document.getElementById("courseLevel").value;

const semester=document.getElementById("courseSemester").value;

const unit=document.getElementById("courseUnit").value;

const lecturer=document.getElementById("courseLecturer").value.trim();

const status=document.getElementById("courseStatus").value;

if(

code==="" ||

title==="" ||

level==="" ||

semester==="" ||

unit===""

){

showWarning("Please complete all required fields.");

return;

}

const courseData={

courseCode:code,

courseTitle:title,

level:level,

semester:semester,

unit:unit,

lecturer:lecturer,

status:status,

updatedAt:firebase.firestore.FieldValue.serverTimestamp()

};

// ======================================
// UPDATE COURSE
// ======================================

if(editingCourse){

coursesRef

.doc(editingCourseId)

.update(courseData)

.then(function(){

showSuccess("Course updated successfully.");

editingCourse=false;

editingCourseId=null;

resetCourseForm();

loadCourses();

updateDashboardCounts();

})

.catch(function(error){

showError(error.message);

});

return;

}

// ======================================
// CHECK DUPLICATE COURSE
// ======================================

coursesRef

.where("courseCode","==",code)

.get()

.then(function(snapshot){

if(!snapshot.empty){

showWarning("This course code already exists.");

return;

}

// ======================================
// SAVE NEW COURSE
// ======================================

courseData.createdAt=

firebase.firestore.FieldValue.serverTimestamp();

coursesRef

.add(courseData)

.then(function(){

showSuccess("Course added successfully.");

resetCourseForm();

loadCourses();

updateDashboardCounts();

})

.catch(function(error){

showError(error.message);

});

});

}
// ======================================
// DELETE COURSE
// ======================================

function deleteCourse(id){

showConfirm(

"Delete Course",

"Are you sure you want to delete this course?"

)

.then(function(result){

if(!result.isConfirmed) return;

coursesRef

.doc(id)

.delete()

.then(function(){

showSuccess("Course deleted successfully.");

loadCourses();

updateDashboardCounts();

})

.catch(function(error){

showError(error.message);

});

});

}

// ======================================
// RESET COURSE FORM
// ======================================

function resetCourseForm(){

document.getElementById("courseCode").value="";

document.getElementById("courseTitle").value="";

document.getElementById("courseLevel").selectedIndex=0;

document.getElementById("courseSemester").selectedIndex=0;

document.getElementById("courseUnit").selectedIndex=0;

document.getElementById("courseLecturer").value="";

document.getElementById("courseStatus").selectedIndex=0;

editingCourse=false;

editingCourseId=null;

document.getElementById("saveCourseBtn").innerHTML=

'<i class="fa-solid fa-floppy-disk"></i> Save Course';

}

// ======================================
// UPDATE DASHBOARD COUNTS
// ======================================

function updateDashboardCounts(){

coursesRef

.get()

.then(function(snapshot){

const count=document.getElementById("courseCount");

if(count){

count.innerHTML=snapshot.size;

}

});

}
// ======================================
// SORT COURSES
// ======================================

function sortCourses(snapshot){

const courses=[];

snapshot.forEach(function(doc){

courses.push({

id:doc.id,

...doc.data()

});

});

courses.sort(function(a,b){

const levelA=parseInt(a.level);

const levelB=parseInt(b.level);

if(levelA!==levelB){

return levelA-levelB;

}

const semA=a.semester==="First Semester"?1:2;

const semB=b.semester==="First Semester"?1:2;

if(semA!==semB){

return semA-semB;

}

return a.courseCode.localeCompare(b.courseCode);

});

return courses;

}

// ======================================
// REFRESH COURSE TABLE
// ======================================

function refreshCourses(){

loadCourses();

updateDashboardCounts();

}

// ======================================
// CLEAR SEARCH
// ======================================

function clearCourseSearch(){

const search=document.getElementById("courseSearch");

if(search){

search.value="";

searchCourses();

}

}

// ======================================
// COURSE MODULE READY
// ======================================

console.log(

"L-TUTOR Course Management v2.0 Loaded Successfully"

);