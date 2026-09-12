// ======================================
// L-TUTOR LOGIN SYSTEM v2.0
// Part 1
// ======================================

// Show / Hide Password
function togglePassword(){

const password = document.getElementById("password");
const icon = document.querySelector(".toggle-password");

if(password.type==="password"){

password.type="text";

icon.classList.remove("fa-eye");
icon.classList.add("fa-eye-slash");

}else{

password.type="password";

icon.classList.remove("fa-eye-slash");
icon.classList.add("fa-eye");

}

}

// ======================================
// LOGIN FORM
// ======================================

const form = document.getElementById("loginForm");

form.addEventListener("submit",loginStudent);

function loginStudent(e){

e.preventDefault();

const email =
document.getElementById("email")
.value
.trim();

const password =
document.getElementById("password")
.value;

const remember =
document.getElementById("remember")
.checked;

// Validation

if(email===""){

showError("Please enter your email address.");

return;

}

if(password===""){

showError("Please enter your password.");

return;

}

// Loading Popup

Swal.fire({

title:"Signing In...",

text:"Please wait while we verify your account.",

allowOutsideClick:false,

allowEscapeKey:false,

didOpen:()=>{

Swal.showLoading();

}

});

const persistence =
remember
? firebase.auth.Auth.Persistence.LOCAL
: firebase.auth.Auth.Persistence.SESSION;

auth.setPersistence(persistence)

.then(()=>{

return auth.signInWithEmailAndPassword(

email,

password

);

})

.then((userCredential)=>{

const uid =
userCredential.user.uid;

return db
.collection("students")
.doc(uid)
.get();

})
  .then((doc)=>{

Swal.close();

if(!doc.exists){

auth.signOut();

showError("Student record was not found.");

return;

}

const student = doc.data();

if(student.status==="Suspended"){

auth.signOut();

showWarning(
"Your account has been suspended.\nPlease contact the Department Administrator."
);

return;

}

if(student.status==="Graduated"){

showSuccess("Welcome back, Graduate!");

setTimeout(function(){

window.location.href="dashboard.html";

},1200);

return;

}

if(student.status==="Active"){

showSuccess("Login Successful!");

setTimeout(function(){

window.location.href="dashboard.html";

},1200);

return;

}

showWarning("Your account is currently unavailable.");

auth.signOut();

})

.catch((error)=>{

Swal.close();

let message="Login failed.";

switch(error.code){

case "auth/user-not-found":
message="No account exists with this email.";
break;

case "auth/wrong-password":
message="Incorrect password.";
break;

case "auth/invalid-email":
message="Please enter a valid email address.";
break;

case "auth/too-many-requests":
message="Too many failed attempts. Please try again later.";
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

const inputs=document.querySelectorAll("input");

inputs.forEach(function(input){

input.addEventListener("focus",function(){

this.parentElement.style.transform="scale(1.02)";

this.parentElement.style.transition=".25s";

});

input.addEventListener("blur",function(){

this.parentElement.style.transform="scale(1)";

});

});


// ======================================
// STUDENT <-> ADMIN LOGIN FLIP SWITCH
// ======================================

(function(){
    const flipper = document.getElementById("loginFlipper");
    const switchButton = document.getElementById("loginSwitch");
    const adminForm = document.getElementById("adminLoginForm");

    if(!flipper || !switchButton) return;

    switchButton.addEventListener("click", function(){
        const isAdmin = flipper.classList.toggle("is-admin");
        switchButton.setAttribute(
            "aria-label",
            isAdmin ? "Switch to student login" : "Switch to administrator login"
        );
        switchButton.setAttribute(
            "title",
            isAdmin ? "Switch to student login" : "Switch to administrator login"
        );
    });

    window.toggleAdminPassword = function(){
        const password = document.getElementById("adminPassword");
        const icon = document.querySelector(".admin-toggle-password");
        if(!password || !icon) return;

        if(password.type === "password"){
            password.type = "text";
            icon.classList.remove("fa-eye");
            icon.classList.add("fa-eye-slash");
        }else{
            password.type = "password";
            icon.classList.remove("fa-eye-slash");
            icon.classList.add("fa-eye");
        }
    };

    const adminEmails = ["olorufemi99@gmail.com"];

    if(adminForm){
        adminForm.addEventListener("submit", async function(e){
            e.preventDefault();

            const email = document.getElementById("adminEmail").value.trim().toLowerCase();
            const password = document.getElementById("adminPassword").value;

            if(!email || !password){
                alert("Please enter your administrator email and password.");
                return;
            }

            try{
                const credential = await auth.signInWithEmailAndPassword(email, password);
                const user = credential.user;

                if(adminEmails.includes(email)){
                    window.location.href = "admin.html";
                    return;
                }

                const snapshot = await db.collection("students").doc(user.uid).get();

                if(snapshot.exists){
                    const student = snapshot.data() || {};
                    const role = String(student.role || "").toLowerCase();

                    if(student.isAdmin === true || role === "admin" || role === "administrator"){
                        window.location.href = "admin.html";
                        return;
                    }
                }

                await auth.signOut();
                alert("Access denied. This account is not an administrator.");

            }catch(error){
                console.error("Admin login error:", error);
                alert(error.message || "Administrator login failed.");
            }
        });
    }
})();
