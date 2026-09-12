// ======================================
// L-TUTOR ADMIN LOGIN
// Supports permanent admin + promoted student admins
// ======================================

const adminEmails = [
    "olorufemi99@gmail.com"
];

function togglePassword(){

    const password = document.getElementById("adminPassword");
    const icon = document.querySelector(".toggle-password");

    if(password.type === "password"){
        password.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    }else{
        password.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    }
}

document.getElementById("adminLoginForm").addEventListener("submit", async function(e){

    e.preventDefault();

    const email = document.getElementById("adminEmail").value.trim().toLowerCase();
    const password = document.getElementById("adminPassword").value;

    try{

        const credential =
            await auth.signInWithEmailAndPassword(email,password);

        const user = credential.user;

        // Original permanent admin account remains valid.
        if(adminEmails.map(x=>x.toLowerCase()).includes(email)){
            window.location.href="admin.html";
            return;
        }

        // A promoted student uses the same Firebase login.
        const snapshot = await db.collection("students")
            .doc(user.uid)
            .get();

        if(snapshot.exists){

            const student = snapshot.data() || {};

            if(
                student.isAdmin === true ||
                String(student.role || "").toLowerCase() === "admin" ||
                String(student.role || "").toLowerCase() === "administrator"
            ){
                window.location.href="admin.html";
                return;
            }
        }

        await auth.signOut();
        alert("Access denied. This account is not an administrator.");

    }catch(error){
        console.error("Admin login error:",error);
        alert(error.message);
    }
});
