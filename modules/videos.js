// ======================================
// L-TUTOR
// VIDEO TUTORIALS MODULE v3.0
// PART 1
// ======================================

let editingVideo=false;
let editingVideoId=null;

function loadVideosModule(){

pageTitle.innerHTML="Video Tutorials";

pageSubtitle.innerHTML="Manage educational videos.";

contentArea.innerHTML=`

<div class="video-admin-module">

<div class="panel">

<h2>

<i class="fa-solid fa-video"></i>

Add Video Tutorial

</h2>

<div class="form-grid">

<div class="form-group">

<label>Course</label>

<select id="videoCourse">

<option>Loading Courses...</option>

</select>

</div>

<div class="form-group">

<label>Video Title</label>

<input
type="text"
id="videoTitle"
placeholder="Introduction to Local Government">

</div>

<div class="form-group">

<label>Lecturer</label>

<input
type="text"
id="videoLecturer"
placeholder="Dr. R. A. Okewale">

</div>

<div class="form-group">

<label>YouTube Link</label>

<input
type="url"
id="videoLink"
placeholder="https://youtu.be/...">

</div>

<div class="form-group">

<label>Description</label>

<textarea
id="videoDescription"
placeholder="Brief description..."></textarea>

</div>

</div>

<button

class="save-btn"

id="saveVideoBtn"

onclick="saveVideo()">

<i class="fa-solid fa-circle-plus"></i>

Save Video

</button>

</div>

<div class="panel">

<h2>

<i class="fa-solid fa-film"></i>

Uploaded Videos

</h2>

<div class="search-box">

<i class="fa-solid fa-magnifying-glass"></i>

<input

type="text"

id="videoSearch"

placeholder="Search Videos..."

onkeyup="searchVideos()">

</div>

<div class="table-wrapper">

<table>

<thead>

<tr>

<th>Course</th>

<th>Title</th>

<th>Lecturer</th>

<th>Actions</th>

</tr>

</thead>

<tbody id="videoTable">

<tr>

<td colspan="4">

Loading Videos...

</td>

</tr>

</tbody>

</table>

</div>

</div>

`;

loadVideoCourseDropdown();

loadVideos();

}
// ======================================
// LOAD COURSE DROPDOWN
// ======================================

function loadVideoCourseDropdown(){

const dropdown=document.getElementById("videoCourse");

if(!dropdown) return;

dropdown.innerHTML='<option value="">Loading Courses...</option>';

coursesRef
.get()
.then(function(snapshot){

const courses=[];

snapshot.forEach(function(doc){
    const c=doc.data() || {};

    if(c.courseCode){
        courses.push(c);
    }
});

courses.sort(function(a,b){
    return String(a.courseCode || "")
        .localeCompare(String(b.courseCode || ""));
});

dropdown.innerHTML="";

if(courses.length===0){

dropdown.innerHTML=
'<option value="">No courses available</option>';

return;

}

courses.forEach(function(c){

dropdown.innerHTML+=`

<option value="${String(c.courseCode).replace(/"/g,"&quot;")}">

${String(c.courseCode).replace(/</g,"&lt;")} -
${String(c.courseTitle || "").replace(/</g,"&lt;")}

</option>

`;

});

})
.catch(function(error){

console.error("Course dropdown error:",error);

dropdown.innerHTML=
'<option value="">Unable to load courses</option>';

});

}

// ======================================
// WAIT FOR FIREBASE AUTH + FIRESTORE
// ======================================

function waitForAdminFirebaseReady(){
    return new Promise(function(resolve,reject){
        var attempts=0;
        var maxAttempts=80;

        function check(){
            attempts++;

            if(!window.db || typeof window.db.collection !== "function"){
                if(attempts>=maxAttempts){
                    reject(new Error("Firestore is not initialized."));
                    return;
                }
                setTimeout(check,150);
                return;
            }

            // Firestore rules require an authenticated administrator.
            if(!window.auth || typeof window.auth.onAuthStateChanged !== "function"){
                if(attempts>=maxAttempts){
                    reject(new Error("Firebase Authentication is not initialized."));
                    return;
                }
                setTimeout(check,150);
                return;
            }

            var user=window.auth.currentUser;
            if(user){
                resolve();
                return;
            }

            var finished=false;
            var unsubscribe=window.auth.onAuthStateChanged(function(currentUser){
                if(finished) return;
                if(currentUser){
                    finished=true;
                    unsubscribe();
                    resolve();
                }
            });

            setTimeout(function(){
                if(finished) return;
                finished=true;
                unsubscribe();
                if(attempts>=maxAttempts){
                    reject(new Error("Administrator authentication is not ready."));
                }else{
                    setTimeout(check,0);
                }
            },300);
        }

        check();
    });
}

// ======================================
// LOAD VIDEOS
// ======================================

function loadVideos(){

const table=document.getElementById("videoTable");

if(!table) return;

table.innerHTML=`
<tr>
<td colspan="4">Loading Videos...</td>
</tr>`;

waitForAdminFirebaseReady()
.then(function(){
    return window.db.collection("videos").get();
})
.then(function(snapshot){

const videos=[];

snapshot.forEach(function(doc){

videos.push({
    id:doc.id,
    ...doc.data()
});

});

videos.sort(function(a,b){

return getVideoTime(b.createdAt) -
       getVideoTime(a.createdAt);

});

if(videos.length===0){

table.innerHTML=`

<tr>
<td colspan="4">
No Videos Uploaded.
</td>
</tr>

`;

return;

}

table.innerHTML="";

videos.forEach(function(video){

table.innerHTML+=`

<tr>

<td>${escapeVideoAdminText(video.courseCode)}</td>

<td>${escapeVideoAdminText(video.title)}</td>

<td>${escapeVideoAdminText(video.lecturer)}</td>

<td>
<button
    class="table-preview-btn"
    onclick="previewVideoAdmin('${escapeVideoAdminAttribute(video.youtubeLink || video.youtubeURL || video.youtubeUrl || video.videoLink || video.videoURL || video.videoUrl || video.url || video.link || "")}','${escapeVideoAdminAttribute(video.title || "Video")}')"
>
    <i class="fa-solid fa-play"></i>
    Preview
</button>

<button
class="edit-btn"
onclick="editVideo('${video.id}')">
Edit
</button>

<button
class="delete-btn"
onclick="deleteVideo('${video.id}')">
Delete
</button>

</td>

</tr>

`;

});

})
.catch(function(error){

console.error("Video loading error:",error);

table.innerHTML=`

<tr>
<td colspan="4">
Unable to load videos.
</td>
</tr>

`;

});

}

function getVideoTime(value){

if(!value) return 0;

try{

if(typeof value.toDate==="function"){
return value.toDate().getTime();
}

if(typeof value.seconds==="number"){
return value.seconds*1000;
}

const d=new Date(value);

return isNaN(d.getTime()) ? 0 : d.getTime();

}catch(error){

return 0;

}

}

function escapeVideoAdminText(value){

return String(value || "")
.replace(/&/g,"&amp;")
.replace(/</g,"&lt;")
.replace(/>/g,"&gt;")
.replace(/"/g,"&quot;")
.replace(/'/g,"&#039;");

}

function escapeVideoAdminAttribute(value){
    return String(value || "")
        .replace(/&/g,"&amp;")
        .replace(/'/g,"&#039;")
        .replace(/"/g,"&quot;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/\r?\n/g," ");
}

// ======================================
// SAVE VIDEO
// ======================================

async function saveVideo(){

try{

const video={

courseCode:videoCourse.value,

title:videoTitle.value.trim(),

lecturer:videoLecturer.value.trim(),

description:videoDescription.value.trim(),

youtubeLink:videoLink.value.trim(),

updatedAt:firebase.firestore.FieldValue.serverTimestamp()

};

if(

video.courseCode==""||

video.title==""||

video.lecturer==""||

video.youtubeLink==""

){

showWarning("Please complete all required fields.");

return;

}

if(editingVideo){

await videosRef

.doc(editingVideoId)

.update(video);

showSuccess("Video Updated Successfully.");

editingVideo=false;

editingVideoId=null;

document.getElementById("saveVideoBtn").innerHTML=

'<i class="fa-solid fa-circle-plus"></i> Save Video';

}else{

video.createdAt=

firebase.firestore.FieldValue.serverTimestamp();

await window.videosRef.add(video);

showSuccess("Video Added Successfully.");

}

videoTitle.value="";

videoLecturer.value="";

videoDescription.value="";

videoLink.value="";

loadVideos();

}catch(error){

showError(error.message);

}

}
// ======================================
// EDIT VIDEO
// ======================================

function editVideo(id){

window.videosRef

.doc(id)

.get()

.then(function(doc){

const video=doc.data();

editingVideo=true;

editingVideoId=id;

videoCourse.value=video.courseCode;

videoTitle.value=video.title;

videoLecturer.value=video.lecturer;

videoDescription.value=video.description||"";

videoLink.value=video.youtubeLink || video.youtubeURL || video.youtubeUrl || video.videoLink || video.videoURL || video.videoUrl || video.url || video.link || "";

document.getElementById("saveVideoBtn").innerHTML=

'<i class="fa-solid fa-pen"></i> Update Video';

showSuccess("Video loaded for editing.");

});

}

// ======================================
// DELETE VIDEO
// ======================================

function deleteVideo(id){

showConfirm(

"Delete Video",

"Delete this video tutorial?"

)

.then((result)=>{

if(!result.isConfirmed) return;

videosRef

.doc(id)

.delete()

.then(function(){

showSuccess("Video Deleted Successfully.");

loadVideos();

});

});

}

// ======================================
// SEARCH VIDEOS
// ======================================

function searchVideos(){

const search=document

.getElementById("videoSearch")

.value

.toUpperCase();

const rows=document

.querySelectorAll("#videoTable tr");

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
