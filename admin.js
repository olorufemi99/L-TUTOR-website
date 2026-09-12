// ======================================
// L-TUTOR ADMIN PORTAL v4.0
// ======================================

// ======================================
// MAIN ELEMENTS
// ======================================

const pageTitle = document.getElementById("pageTitle");
const pageSubtitle = document.getElementById("pageSubtitle");
const contentArea = document.getElementById("contentArea");


// ======================================
// ADMIN STATE
// ======================================

let currentModule = "dashboard";


// ======================================
// SET MODULE
// ======================================

function setModule(name){

    currentModule = name;

    console.log("Current Module:", currentModule);

}


// ======================================
// PAGE ROUTER
// ======================================

function loadPage(page){

    setModule(page);

    console.log("Loading page:", page);

    switch(page){

        case "dashboard":
            loadDashboard();
            break;

        case "courses":
            loadCoursesModule();
            break;

        case "lecturers":
            loadLecturersModule();
            break;

        case "notes":
            loadLectureNotesModule();
            break;

        case "past":
            loadPastQuestionsModule();
            break;

        case "videos":
            loadVideosModule();
            break;

        case "books":
            loadBooksModule();
            break;

        case "announcements":
            loadAnnouncementsModule();
            break;

        case "news":
            loadNewsModule();
            break;

        case "students":
            loadStudentsModule();
            break;

        case "settings":
            loadSettingsModule();
            break;

        default:
            loadDashboard();
            break;

    }

}


// ======================================
// SIDEBAR NAVIGATION
// ======================================

document
.querySelector(".sidebar")
.addEventListener("click", function(event){

    const item = event.target.closest(".menu-item");

    if(!item){
        return;
    }

    const page = item.getAttribute("data-page");

    if(!page){
        return;
    }

    document
    .querySelectorAll(".menu-item")
    .forEach(function(menu){

        menu.classList.remove("active");

    });

    item.classList.add("active");

    try{

        loadPage(page);

    }

    catch(error){

        console.error("Page error:", error);

        if(typeof showError === "function"){

            showError(error.message);

        }else{

            alert(error.message);

        }

    }

});


// ======================================
// DASHBOARD
// ======================================

function loadDashboard(){

    pageTitle.innerHTML = "Dashboard";

    pageSubtitle.innerHTML =
    "Welcome back, Administrator.";

    contentArea.innerHTML = `

    <!-- ================================
         STUDENT OVERVIEW
    ================================= -->

    <div class="panel">

        <h2>
            <i class="fa-solid fa-users"></i>
            Student Overview
        </h2>

        <div class="stats">

            <div class="card">

                <i class="fa-solid fa-users"></i>

                <h2 id="studentCount">
                    0
                </h2>

                <p>
                    Total Students
                </p>

            </div>


            <div class="card">

                <i class="fa-solid fa-user-check"></i>

                <h2 id="activeStudentCount">
                    0
                </h2>

                <p>
                    Active Students
                </p>

            </div>


            <div class="card">

                <i class="fa-solid fa-user-slash"></i>

                <h2 id="suspendedStudentCount">
                    0
                </h2>

                <p>
                    Suspended
                </p>

            </div>


            <div class="card">

                <i class="fa-solid fa-graduation-cap"></i>

                <h2 id="graduatedStudentCount">
                    0
                </h2>

                <p>
                    Graduated
                </p>

            </div>

        </div>

    </div>


    <!-- ================================
         STUDENTS BY LEVEL
    ================================= -->

    <div class="panel">

        <h2>
            <i class="fa-solid fa-chart-column"></i>
            Students by Level
        </h2>

        <div class="stats">

            <div class="card">

                <i class="fa-solid fa-user-graduate"></i>

                <h2 id="dashboard100">
                    0
                </h2>

                <p>
                    100 Level
                </p>

            </div>


            <div class="card">

                <i class="fa-solid fa-user-graduate"></i>

                <h2 id="dashboard200">
                    0
                </h2>

                <p>
                    200 Level
                </p>

            </div>


            <div class="card">

                <i class="fa-solid fa-user-graduate"></i>

                <h2 id="dashboard300">
                    0
                </h2>

                <p>
                    300 Level
                </p>

            </div>


            <div class="card">

                <i class="fa-solid fa-user-graduate"></i>

                <h2 id="dashboard400">
                    0
                </h2>

                <p>
                    400 Level
                </p>

            </div>


            <div class="card">

                <i class="fa-solid fa-user-graduate"></i>

                <h2 id="dashboard500">
                    0
                </h2>

                <p>
                    500 Level
                </p>

            </div>

        </div>

    </div>


    <!-- ================================
         GENERAL PORTAL STATISTICS
    ================================= -->

    <div class="stats">

        <div class="card">

            <i class="fa-solid fa-book"></i>

            <h2 id="courseCount">
                0
            </h2>

            <p>
                Courses
            </p>

        </div>


        <div class="card">

            <i class="fa-solid fa-chalkboard-user"></i>

            <h2 id="lecturerCount">
                0
            </h2>

            <p>
                Lecturers
            </p>

        </div>


        <div class="card">

            <i class="fa-solid fa-bullhorn"></i>

            <h2 id="announcementCount">
                0
            </h2>

            <p>
                Announcements
            </p>

        </div>

    </div>


    <!-- ================================
         RECENT ACTIVITY
    ================================= -->

    <div class="panel">

        <h2>

            <i class="fa-solid fa-clock-rotate-left"></i>

            Recent Activity

        </h2>


        <table>

            <thead>

                <tr>

                    <th>
                        Activity
                    </th>

                    <th>
                        Date
                    </th>

                </tr>

            </thead>


            <tbody id="recentActivity">

                <tr>

                    <td colspan="2">
                        Loading...
                    </td>

                </tr>

            </tbody>

        </table>

    </div>

    `;

    loadDashboardStatistics();

}


// ======================================
// NORMALIZE LEVEL
// ======================================

function dashboardNormalizeLevel(level){

    if(
        level === undefined ||
        level === null
    ){

        return "";

    }

    return String(level)
    .replace(/level/gi, "")
    .trim();

}


// ======================================
// DASHBOARD STATISTICS
// ======================================

function loadDashboardStatistics(){

    // ==================================
    // STUDENTS
    // ==================================

    db.collection("students")
    .get()

    .then(function(snapshot){

        let total = snapshot.size;

        let active = 0;

        let suspended = 0;

        let graduated = 0;

        let level100 = 0;

        let level200 = 0;

        let level300 = 0;

        let level400 = 0;

        let level500 = 0;


        snapshot.forEach(function(doc){

            const student = doc.data();


            // STATUS

            const status =
            String(student.status || "")
            .trim()
            .toLowerCase();


            if(status === "active"){

                active++;

            }

            else if(status === "suspended"){

                suspended++;

            }

            else if(status === "graduated"){

                graduated++;

            }


            // LEVEL

            const level =
            dashboardNormalizeLevel(
                student.level
            );


            if(level === "100"){

                level100++;

            }

            else if(level === "200"){

                level200++;

            }

            else if(level === "300"){

                level300++;

            }

            else if(level === "400"){

                level400++;

            }

            else if(level === "500"){

                level500++;

            }

        });


        // ==================================
        // MAIN STUDENT COUNTS
        // ==================================

        setDashboardText(
            "studentCount",
            total
        );

        setDashboardText(
            "activeStudentCount",
            active
        );

        setDashboardText(
            "suspendedStudentCount",
            suspended
        );

        setDashboardText(
            "graduatedStudentCount",
            graduated
        );


        // ==================================
        // LEVEL COUNTS
        // ==================================

        setDashboardText(
            "dashboard100",
            level100
        );

        setDashboardText(
            "dashboard200",
            level200
        );

        setDashboardText(
            "dashboard300",
            level300
        );

        setDashboardText(
            "dashboard400",
            level400
        );

        setDashboardText(
            "dashboard500",
            level500
        );

    })

    .catch(function(error){

        console.error(
            "Student dashboard error:",
            error
        );

    });


    // ==================================
    // COURSES
    // ==================================

    db.collection("courses")
    .get()

    .then(function(snapshot){

        setDashboardText(
            "courseCount",
            snapshot.size
        );

    })

    .catch(function(error){

        console.error(
            "Course dashboard error:",
            error
        );

    });


    // ==================================
    // LECTURERS
    // ==================================

    db.collection("lecturers")
    .get()

    .then(function(snapshot){

        setDashboardText(
            "lecturerCount",
            snapshot.size
        );

    })

    .catch(function(error){

        console.error(
            "Lecturer dashboard error:",
            error
        );

    });


    // ==================================
    // ANNOUNCEMENTS
    // ==================================

    db.collection("announcements")
    .get()

    .then(function(snapshot){

        setDashboardText(
            "announcementCount",
            snapshot.size
        );

    })

    .catch(function(error){

        console.error(
            "Announcement dashboard error:",
            error
        );

    });


    // ==================================
    // RECENT ACTIVITY
    // ==================================

    const activity =
    document.getElementById(
        "recentActivity"
    );


    if(activity){

        activity.innerHTML = `

        <tr>

            <td>
                Administrator logged into the system
            </td>

            <td>
                Today
            </td>

        </tr>

        `;

    }

}


// ======================================
// DASHBOARD TEXT HELPER
// ======================================

function setDashboardText(id, value){

    const element =
    document.getElementById(id);

    if(element){

        element.innerHTML = value;

    }

}


// ======================================
// LOGOUT
// ======================================

const logoutBtn =
document.getElementById("logoutBtn");


if(logoutBtn){

    logoutBtn.addEventListener(
        "click",
        function(){

            showConfirm(
                "Logout",
                "Are you sure you want to logout?"
            )

            .then(function(result){

                if(!result.isConfirmed){

                    return;

                }


                Swal.fire({

                    title:
                    "Logging Out...",

                    text:
                    "Please wait...",

                    allowOutsideClick:
                    false,

                    allowEscapeKey:
                    false,

                    didOpen:function(){

                        Swal.showLoading();

                    }

                });


                auth.signOut()

                .then(function(){

                    window.location.href =
                    "admin-login.html";

                })

                .catch(function(error){

                    Swal.close();

                    showError(
                        error.message
                    );

                });

            });

        }
    );

}


// ======================================
// START APPLICATION
// ======================================

window.addEventListener(
    "load",
    function(){

        loadDashboard();

    }
);