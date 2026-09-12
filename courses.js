// ==========================================
// L-TUTOR COURSES
// OLD DESIGN RESTORED
// ==========================================

let allCourses = [];


// ==========================================
// ELEMENTS
// ==========================================

const courseList =
    document.getElementById("courseList");

const courseInfo =
    document.getElementById("courseInfo");

const courseSearch =
    document.getElementById("courseSearch");

const levelFilter =
    document.getElementById("levelFilter");

const semesterFilter =
    document.getElementById("semesterFilter");


// ==========================================
// START
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadCourses();

        setupEvents();

    }
);


// ==========================================
// EVENTS
// ==========================================

function setupEvents() {

    if (courseSearch) {

        courseSearch.addEventListener(
            "input",
            filterCourses
        );

    }


    if (levelFilter) {

        levelFilter.addEventListener(
            "change",
            filterCourses
        );

    }


    if (semesterFilter) {

        semesterFilter.addEventListener(
            "change",
            filterCourses
        );

    }

}


// ==========================================
// LOAD COURSES
// ==========================================

function loadCourses() {

    if (!courseList) {
        return;
    }


    courseList.innerHTML = `

        <div class="course-loading">

            <i class="fa-solid fa-spinner fa-spin"></i>

            <p>Loading courses...</p>

        </div>

    `;


    db.collection("courses")
        .get()

        .then(function (snapshot) {

            allCourses = [];


            snapshot.forEach(function (doc) {

                const course =
                    doc.data();


                course.id =
                    doc.id;


                allCourses.push(course);

            });


            filterCourses();

        })

        .catch(function (error) {

            console.error(
                "Courses Error:",
                error
            );


            courseList.innerHTML = `

                <div class="course-empty">

                    <i class="
                        fa-solid
                        fa-triangle-exclamation
                    "></i>

                    <h3>
                        Unable to Load Courses
                    </h3>

                    <p>
                        ${escapeHTML(
                            error.message
                        )}
                    </p>

                </div>

            `;

        });

}


// ==========================================
// FILTER
// ==========================================

function filterCourses() {

    const search =
        courseSearch
            ? courseSearch.value
                .toLowerCase()
                .trim()
            : "";


    const selectedLevel =
        levelFilter
            ? levelFilter.value
            : "All";


    const selectedSemester =
        semesterFilter
            ? semesterFilter.value
            : "All";


    const filtered =
        allCourses.filter(
            function (course) {


                const code =
                    String(
                        course.code ||
                        course.courseCode ||
                        ""
                    )
                    .toLowerCase();


                const title =
                    String(
                        course.title ||
                        course.courseTitle ||
                        course.name ||
                        ""
                    )
                    .toLowerCase();


                const level =
                    normalizeLevel(
                        course.level
                    );


                const semester =
                    normalizeSemester(
                        course.semester
                    );


                const searchMatch =

                    code.includes(search) ||

                    title.includes(search);


                const levelMatch =

                    selectedLevel === "All" ||

                    level ===
                    normalizeLevel(
                        selectedLevel
                    );


                const semesterMatch =

                    selectedSemester === "All" ||

                    semester ===
                    normalizeSemester(
                        selectedSemester
                    );


                return (

                    searchMatch &&

                    levelMatch &&

                    semesterMatch

                );

            }
        );


    displayCourses(filtered);

}


// ==========================================
// DISPLAY COURSES
// ==========================================

function displayCourses(courses) {

    if (!courseList) {
        return;
    }


    courseList.innerHTML = "";


    if (courses.length === 0) {

        courseList.innerHTML = `

            <div class="course-empty">

                <i class="
                    fa-solid
                    fa-book-open
                "></i>

                <h3>
                    No Courses Found
                </h3>

                <p>
                    Try changing your search
                    or filters.
                </p>

            </div>

        `;


        updateCourseInfo(0);

        return;

    }


    courses.forEach(
        function (course) {


            const code =

                course.code ||

                course.courseCode ||

                "--";


            const title =

                course.title ||

                course.courseTitle ||

                course.name ||

                "Untitled Course";


            // ==================================
            // CARD
            // ==================================

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "course-card";


            card.innerHTML = `

                <div class="course-card-inner">

                    <div class="course-icon">

                        <i class="
                            fa-solid
                            fa-book-open
                        "></i>

                    </div>


                    <h2 class="course-code">

                        ${escapeHTML(code)}

                    </h2>


                    <p class="course-title">

                        ${escapeHTML(title)}

                    </p>


                    <button
                        class="open-course-btn"
                        type="button"
                    >

                        Open Course

                    </button>

                </div>

            `;


            courseList.appendChild(
                card
            );


            // ==================================
            // OPEN COURSE
            // ==================================

            const button =
                card.querySelector(
                    ".open-course-btn"
                );


            button.addEventListener(
                "click",
                function () {

                    openCourse(
                        course.id
                    );

                }
            );

        }
    );


    updateCourseInfo(
        courses.length
    );

}


// ==========================================
// COURSE COUNT
// ==========================================

function updateCourseInfo(count) {

    if (!courseInfo) {
        return;
    }


    courseInfo.innerHTML = `

        Showing

        <strong>
            ${count}
        </strong>

        course${count === 1 ? "" : "s"}

    `;

}


// ==========================================
// NORMALIZE LEVEL
// ==========================================

function normalizeLevel(level) {

    if (
        level === undefined ||
        level === null
    ) {

        return "";

    }


    return String(level)
        .replace(
            /level/gi,
            ""
        )
        .trim();

}


// ==========================================
// NORMALIZE SEMESTER
// ==========================================

function normalizeSemester(semester) {

    if (
        semester === undefined ||
        semester === null
    ) {

        return "";

    }


    return String(semester)
        .replace(
            /semester/gi,
            ""
        )
        .trim()
        .toLowerCase();

}


// ==========================================
// OPEN COURSE
// ==========================================

function openCourse(courseId) {

    if (!courseId) {
        return;
    }


    localStorage.setItem(
        "selectedCourseId",
        courseId
    );


    window.location.href =
        "course.html?id=" +
        encodeURIComponent(
            courseId
        );

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value) {

    if (
        value === undefined ||
        value === null
    ) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// ==========================================
// REFRESH
// ==========================================

window.refreshCourses =
    function () {

        loadCourses();

    };