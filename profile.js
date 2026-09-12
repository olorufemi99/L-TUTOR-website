// ======================================
// L-TUTOR
// PROFILE.JS (PART 2)
// LOAD STUDENT PROFILE
// ======================================

auth.onAuthStateChanged(function(user){

if(!user){

window.location.href="login.html";

return;

}

db.collection("students")
.doc(user.uid)
.get()
.then(function(doc){
if(!doc.exists){
showWarning("Student profile not found.");
return;
}
const student=doc.data();

const photo=student.passport||"images/default-user.svg";

document.getElementById("studentPhoto").src=photo;

document.getElementById("studentName").innerHTML=student.fullname;

document.getElementById("studentMatric").innerHTML=student.matricNumber;

document.getElementById("fullname").innerHTML=student.fullname;

document.getElementById("matricNumber").innerHTML=student.matricNumber;

document.getElementById("email").innerHTML=student.email;

document.getElementById("phone").innerHTML=student.phone;

document.getElementById("department").innerHTML=student.department;

document.getElementById("faculty").innerHTML=student.faculty;

document.getElementById("level").innerHTML=student.level+" Level";

document.getElementById("modeOfEntry").innerHTML=student.modeOfEntry;

document.getElementById("admissionYear").innerHTML =
student.admissionYear || "Not Available";

const status = student.status || "Active";

document.getElementById("status").innerHTML =
`<span class="status-badge">${status}</span>`;

});

});
// ======================================
// L-TUTOR
// PROFILE.JS (PART 3)

// EDIT PROFILE
function editProfile(){

    Swal.fire({
        title:"Edit Profile",
        html:`
            <input
                id="swalPhone"
                class="swal2-input"
                placeholder="Phone Number"
                value="${escapeProfileText(document.getElementById("phone").innerHTML)}">
            <p style="font-size:13px;color:#777;margin:8px 20px 0;">
                Profile picture is changed with the camera button above.
            </p>
        `,
        focusConfirm:false,
        showCancelButton:true,
        confirmButtonText:"Save Changes",
        preConfirm:()=>{
            return {
                phone:document.getElementById("swalPhone").value.trim()
            };
        }
    }).then(async (result)=>{
        if(!result.isConfirmed || !auth.currentUser) return;

        try{
            const ref = db.collection("students").doc(auth.currentUser.uid);
            const snapshot = await ref.get();

            if(!snapshot.exists) throw new Error("Student profile not found.");

            await ref.update({
                phone: result.value.phone,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            showSuccess("Profile updated successfully.");
            document.getElementById("phone").innerHTML =
                escapeProfileText(result.value.phone || "Not Available");
        }catch(error){
            showError(error.message);
        }
    });
}


// PROFILE PHOTO UPLOAD
async function handleProfilePhoto(input){

    const file = input && input.files ? input.files[0] : null;
    const image = document.getElementById("studentPhoto");
    const status = document.getElementById("profileUploadStatus");

    if(!file) return;

    if(!file.type.startsWith("image/")){
        showWarning("Please select an image file.");
        input.value="";
        return;
    }

    // Instant local preview
    const reader = new FileReader();
    reader.onload = function(e){
        image.src = e.target.result;
    };
    reader.readAsDataURL(file);

    try{
        if(status){
            status.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading photo...';
            status.style.display = "block";
        }

        const uploaded = await uploadFile(file);

        if(!uploaded || !uploaded.url){
            throw new Error("Image upload did not return a URL.");
        }

        const ref = db.collection("students").doc(auth.currentUser.uid);
        const snapshot = await ref.get();

        if(!snapshot.exists) throw new Error("Student profile not found.");

        await ref.update({
            passport: uploaded.url,
            passportFileName: uploaded.originalName || file.name,
            passportUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        image.src = uploaded.url;

        if(status){
            status.innerHTML = '<i class="fa-solid fa-circle-check"></i> Profile picture updated.';
        }

        showSuccess("Profile picture updated successfully.");

    }catch(error){

        console.error("Profile photo error:", error);

        if(status){
            status.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> ' +
                escapeProfileText(error.message);
        }

        showError(error.message);

    }finally{
        input.value="";
    }
}

function escapeProfileText(value){
    return String(value || "")
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");
}

// ======================================
// CHANGE PASSWORD
// ======================================

function changePassword(){

auth.sendPasswordResetEmail(auth.currentUser.email)

.then(function(){

showSuccess(

"A password reset link has been sent to your email."

);

})

.catch(function(error){

showError(error.message);

});

}

// ======================================
// LOGOUT
// ======================================

function logout(){

showConfirm(

"Logout",

"Are you sure you want to logout?"

)

.then((result)=>{

if(!result.isConfirmed) return;

auth.signOut()

.then(function(){

showSuccess("Logged out successfully.");

window.location.href="login.html";

});

});

}
// ======================================
// L-TUTOR
// PROFILE.JS (PART 4)
// AUTO REFRESH + VALIDATION
// ======================================

