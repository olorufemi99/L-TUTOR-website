// ======================================
// L-TUTOR STUDENT MANAGEMENT v4.0
// ======================================
// Student Management
// Search + Filters + Numbering + Profiles
// ======================================


let allStudents = [];


// ======================================
// LOAD STUDENTS MODULE
// ======================================

function loadStudentsModule(){

    pageTitle.innerHTML =
    "Student Management";


    pageSubtitle.innerHTML =
    "Manage registered students and view student profiles.";


    contentArea.innerHTML = `

    <!-- =================================
         REGISTERED STUDENTS
    ================================= -->

    <div class="panel">

        <h2>

            <i class="fa-solid fa-users"></i>

            Registered Students

        </h2>


        <!-- =================================
             TOOLBAR
        ================================= -->

        <div class="student-toolbar">


            <!-- SEARCH -->

            <div class="search-box">

                <i class="fa-solid fa-magnifying-glass"></i>

                <input

                    type="text"

                    id="studentSearch"

                    placeholder="Search by name or matric number..."

                >

            </div>


            <!-- FILTERS -->

            <div class="filter-box">


                <select id="levelFilter">

                    <option value="All">
                        All Levels
                    </option>

                    <option value="100">
                        100 Level
                    </option>

                    <option value="200">
                        200 Level
                    </option>

                    <option value="300">
                        300 Level
                    </option>

                    <option value="400">
                        400 Level
                    </option>

                    <option value="500">
                        500 Level
                    </option>

                </select>


                <select id="statusFilter">

                    <option value="All">
                        All Status
                    </option>

                    <option value="Active">
                        Active
                    </option>

                    <option value="Graduated">
                        Graduated
                    </option>

                    <option value="Suspended">
                        Suspended
                    </option>

                </select>


                <button

                    class="save-btn"

                    id="refreshStudentsBtn"

                >

                    <i class="fa-solid fa-rotate"></i>

                    Refresh

                </button>


            </div>

        </div>


        <!-- =================================
             RESULT INFORMATION
        ================================= -->

        <div
            id="studentViewInfo"
            style="
                margin:18px 0;
                color:#666;
                font-size:14px;
            "
        >

            Loading students...

        </div>


        <!-- =================================
             TABLE
        ================================= -->

        <div style="overflow-x:auto;">

            <table class="student-table">

                <thead>

                    <tr>

                        <th>
                            No.
                        </th>

                        <th>
                            Passport
                        </th>

                        <th>
                            Student
                        </th>

                        <th>
                            Matric Number
                        </th>

                        <th>
                            Level
                        </th>

                        <th>
                            Status
                        </th>

                        <th>
                            Action
                        </th>

                        <th>
                            Administrator
                        </th>

                    </tr>

                </thead>


                <tbody id="studentsTable">

                    <tr>

                        <td
                            colspan="8"
                            style="
                                text-align:center;
                                padding:35px;
                            "
                        >

                            <i
                                class="fa-solid fa-spinner fa-spin"
                            ></i>

                            <br><br>

                            Loading students...

                        </td>

                    </tr>

                </tbody>

            </table>

        </div>

    </div>

    `;


    // ======================================
    // SEARCH EVENT
    // ======================================

    const search =
    document.getElementById(
        "studentSearch"
    );


    if(search){

        search.addEventListener(
            "input",
            filterStudents
        );

    }


    // ======================================
    // LEVEL FILTER
    // ======================================

    const level =
    document.getElementById(
        "levelFilter"
    );


    if(level){

        level.addEventListener(
            "change",
            filterStudents
        );

    }


    // ======================================
    // STATUS FILTER
    // ======================================

    const status =
    document.getElementById(
        "statusFilter"
    );


    if(status){

        status.addEventListener(
            "change",
            filterStudents
        );

    }


    // ======================================
    // REFRESH
    // ======================================

    const refresh =
    document.getElementById(
        "refreshStudentsBtn"
    );


    if(refresh){

        refresh.addEventListener(
            "click",
            loadStudents
        );

    }


    // ======================================
    // LOAD DATA
    // ======================================

    loadStudents();

}


// ======================================
// LOAD STUDENTS FROM FIRESTORE
// ======================================

function loadStudents(){

    const table =
    document.getElementById(
        "studentsTable"
    );


    if(!table){

        return;

    }


    table.innerHTML = `

    <tr>

        <td
            colspan="8"
            style="
                text-align:center;
                padding:35px;
            "
        >

            <i
                class="fa-solid fa-spinner fa-spin"
                style="font-size:22px;"
            ></i>

            <br><br>

            Loading students...

        </td>

    </tr>

    `;


    // IMPORTANT:
    // Directly connect to Firestore.
    // No studentsRef required.

    db.collection("students")
    .get()

    .then(function(snapshot){

        allStudents = [];


        snapshot.forEach(function(doc){

            const student =
            doc.data();


            student.id =
            doc.id;


            allStudents.push(
                student
            );

        });


        // Sort alphabetically

        allStudents.sort(
            function(a,b){

                const nameA =
                String(
                    a.fullname || ""
                ).toLowerCase();


                const nameB =
                String(
                    b.fullname || ""
                ).toLowerCase();


                return nameA.localeCompare(
                    nameB
                );

            }
        );


        filterStudents();

    })


    .catch(function(error){

        console.error(
            "Firestore Students Error:",
            error
        );


        table.innerHTML = `

        <tr>

            <td
                colspan="8"
                style="
                    color:#e53935;
                    text-align:center;
                    padding:35px;
                "
            >

                <i
                    class="fa-solid fa-triangle-exclamation"
                    style="font-size:25px;"
                ></i>

                <br><br>

                <strong>
                    Unable to load students.
                </strong>

                <br><br>

                ${error.message}

            </td>

        </tr>

        `;

    });

}


// ======================================
// NORMALIZE LEVEL
// ======================================

function normalizeStudentLevel(level){

    if(
        level === undefined ||
        level === null
    ){

        return "";

    }


    return String(level)
    .replace(
        /level/gi,
        ""
    )
    .trim();

}


// ======================================
// FILTER STUDENTS
// ======================================

function filterStudents(){

    const searchElement =
    document.getElementById(
        "studentSearch"
    );


    const levelElement =
    document.getElementById(
        "levelFilter"
    );


    const statusElement =
    document.getElementById(
        "statusFilter"
    );


    if(
        !searchElement ||
        !levelElement ||
        !statusElement
    ){

        return;

    }


    const search =
    searchElement.value
    .toLowerCase()
    .trim();


    const selectedLevel =
    levelElement.value;


    const selectedStatus =
    statusElement.value;


    const filtered =
    allStudents.filter(
        function(student){

            const name =
            String(
                student.fullname || ""
            )
            .toLowerCase();


            const matric =
            String(
                student.matricNumber || ""
            )
            .toLowerCase();


            const level =
            normalizeStudentLevel(
                student.level
            );


            const status =
            String(
                student.status || ""
            )
            .trim();


            const matchesSearch =

                name.includes(search)

                ||

                matric.includes(search);


            const matchesLevel =

                selectedLevel === "All"

                ||

                level === selectedLevel;


            const matchesStatus =

                selectedStatus === "All"

                ||

                status.toLowerCase() ===
                selectedStatus.toLowerCase();


            return (

                matchesSearch &&

                matchesLevel &&

                matchesStatus

            );

        }
    );


    displayStudents(
        filtered
    );

}


// ======================================
// DISPLAY STUDENTS
// ======================================

function displayStudents(list){

    const table =
    document.getElementById(
        "studentsTable"
    );


    if(!table){

        return;

    }


    table.innerHTML = "";


    if(list.length === 0){

        table.innerHTML = `

        <tr>

            <td
                colspan="8"
                style="
                    text-align:center;
                    padding:40px;
                "
            >

                <i
                    class="fa-solid fa-user-slash"
                    style="
                        font-size:28px;
                    "
                ></i>

                <br><br>

                No students found.

            </td>

        </tr>

        `;


        updateStudentViewInfo(
            0
        );

        return;

    }


    // ==================================
    // NUMBER STUDENTS
    // ==================================

    list.forEach(
        function(student,index){

            const passport =

            student.passport ||

            "images/default-user.png";


            const level =
            normalizeStudentLevel(
                student.level
            );


            const status =
            student.status ||
            "Unknown";


            let statusColor =
            "#777";


            if(
                status.toLowerCase() ===
                "active"
            ){

                statusColor =
                "#4CAF50";

            }

            else if(
                status.toLowerCase() ===
                "graduated"
            ){

                statusColor =
                "#FF9800";

            }

            else if(
                status.toLowerCase() ===
                "suspended"
            ){

                statusColor =
                "#F44336";

            }


            table.innerHTML += `

            <tr>

                <!-- NUMBER -->

                <td>

                    <strong>
                        ${index + 1}
                    </strong>

                </td>


                <!-- PASSPORT -->

                <td>

                    <img

                        src="${passport}"

                        onerror="
                        this.src='images/default-user.png'
                        "

                        style="
                            width:45px;
                            height:45px;
                            object-fit:cover;
                            border-radius:50%;
                        "

                    >

                </td>


                <!-- STUDENT -->

                <td>

                    <strong>

                        ${student.fullname || "--"}

                    </strong>

                </td>


                <!-- MATRIC -->

                <td>

                    ${student.matricNumber || "--"}

                </td>


                <!-- LEVEL -->

                <td>

                    ${
                        level
                        ? level + " Level"
                        : "--"
                    }

                </td>


                <!-- STATUS -->

                <td>

                    <span

                        style="
                            background:${statusColor};
                            color:white;
                            padding:5px 12px;
                            border-radius:20px;
                            font-size:12px;
                            white-space:nowrap;
                        "

                    >

                        ${status}

                    </span>

                </td>


                <!-- ACTION -->

                <td>

                    <button

                        class="save-btn"

                        onclick="
                        viewStudent('${student.id}')
                        "

                    >

                        <i
                            class="fa-solid fa-eye"
                        ></i>

                        View

                    </button>

                </td>

                <td>

                    ${
                        student.isAdmin === true ||
                        String(student.role || "").toLowerCase() === "admin" ||
                        String(student.role || "").toLowerCase() === "administrator"
                        ? `
                            <button
                                class="delete-btn"
                                onclick="setStudentAdmin('${student.id}', false)"
                            >
                                <i class="fa-solid fa-user-shield"></i>
                                Remove Admin
                            </button>
                          `
                        : `
                            <button
                                class="save-btn"
                                onclick="setStudentAdmin('${student.id}', true)"
                            >
                                <i class="fa-solid fa-user-shield"></i>
                                Make Admin
                            </button>
                          `
                    }

                </td>

            </tr>

            `;

        }
    );


    updateStudentViewInfo(
        list.length
    );

}


// ======================================
// RESULT INFORMATION
// ======================================

function updateStudentViewInfo(
    count
){

    const info =
    document.getElementById(
        "studentViewInfo"
    );


    if(!info){

        return;

    }


    const level =
    document.getElementById(
        "levelFilter"
    );


    const status =
    document.getElementById(
        "statusFilter"
    );


    let message = `

        Showing

        <strong>
            ${count}
        </strong>

        student${count === 1 ? "" : "s"}

    `;


    if(
        level &&
        level.value !== "All"
    ){

        message += `

            in

            <strong>
                ${level.value} Level
            </strong>

        `;

    }


    if(
        status &&
        status.value !== "All"
    ){

        message += `

            with status

            <strong>
                ${status.value}
            </strong>

        `;

    }


    info.innerHTML =
    message;

}


// ======================================
// VIEW STUDENT
// ======================================

function viewStudent(id){

    const student =
    allStudents.find(
        function(item){

            return item.id === id;

        }
    );


    if(!student){

        return;

    }


    const passport =

    student.passport ||

    "images/default-user.png";


    const level =
    normalizeStudentLevel(
        student.level
    );


    contentArea.innerHTML = `

    <div class="panel">


        <button

            class="save-btn"

            onclick="
            loadStudentsModule()
            "

        >

            <i
                class="fa-solid fa-arrow-left"
            ></i>

            Back to Students

        </button>


        <br><br>


        <div
            style="
                text-align:center;
            "
        >

            <img

                src="${passport}"

                onerror="
                this.src='images/default-user.png'
                "

                style="
                    width:140px;
                    height:140px;
                    border-radius:50%;
                    object-fit:cover;
                    border:5px solid #6A1B9A;
                "

            >


            <h2>

                ${student.fullname || "--"}

            </h2>


            <p>

                ${student.matricNumber || "--"}

            </p>

        </div>


        <hr
            style="
                margin:30px 0;
            "
        >


        <table>

            <tr>

                <th>
                    Email
                </th>

                <td>
                    ${student.email || "--"}
                </td>

            </tr>


            <tr>

                <th>
                    Phone
                </th>

                <td>
                    ${student.phone || "--"}
                </td>

            </tr>


            <tr>

                <th>
                    Department
                </th>

                <td>
                    ${student.department || "--"}
                </td>

            </tr>


            <tr>

                <th>
                    Faculty
                </th>

                <td>
                    ${student.faculty || "--"}
                </td>

            </tr>


            <tr>

                <th>
                    Level
                </th>

                <td>
                    ${level ? level + " Level" : "--"}
                </td>

            </tr>


            <tr>

                <th>
                    Status
                </th>

                <td>
                    ${student.status || "Unknown"}
                </td>

            </tr>

        </table>

        <div style="margin-top:25px;display:flex;gap:10px;flex-wrap:wrap;">

            ${
                student.isAdmin === true ||
                String(student.role || "").toLowerCase() === "admin" ||
                String(student.role || "").toLowerCase() === "administrator"
                ? `
                    <button class="delete-btn"
                        onclick="setStudentAdmin('${student.id}', false)">
                        <i class="fa-solid fa-user-shield"></i>
                        Remove Administrator
                    </button>
                  `
                : `
                    <button class="save-btn"
                        onclick="setStudentAdmin('${student.id}', true)">
                        <i class="fa-solid fa-user-shield"></i>
                        Make Student Administrator
                    </button>
                  `
            }

        </div>

    </div>

    `;

}

// ======================================
// PROMOTE / DEMOTE STUDENT ADMIN
// ======================================

async function setStudentAdmin(id, makeAdmin){

    try{

        const ref = db.collection("students").doc(id);
        const snap = await ref.get();

        if(!snap.exists){
            throw new Error("Student record not found.");
        }

        const student = snap.data() || {};

        if(!student.email){
            throw new Error("This student has no email address.");
        }

        const confirmed = await showConfirm(
            makeAdmin ? "Make Administrator" : "Remove Administrator",
            makeAdmin
                ? "This student's existing login will be allowed to enter the Admin Portal."
                : "This student will no longer be allowed to enter the Admin Portal."
        );

        if(!confirmed.isConfirmed) return;

        await ref.update({
            isAdmin: makeAdmin,
            role: makeAdmin ? "admin" : "student",
            adminUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        showSuccess(
            makeAdmin
                ? "Student is now an administrator."
                : "Administrator access removed."
        );

        loadStudents();

    }catch(error){

        console.error("Student admin update error:",error);
        showError(error.message);

    }
}
