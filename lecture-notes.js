// ======================================
// L-TUTOR
// LECTURE NOTES
// STUDENT COURSE LIST
// ======================================

document.addEventListener("DOMContentLoaded", function(){

    const courseList =
        document.getElementById("courseList");

    const searchInput =
        document.getElementById("courseSearch");


    let allCourses = [];


    // ======================================
    // LOAD
    // ======================================

    loadLectureNoteCourses();


    async function loadLectureNoteCourses(){

        showLoading();


        try{

            const notesSnapshot =
                await db
                    .collection("lectureNotes")
                    .orderBy(
                        "uploadedAt",
                        "desc"
                    )
                    .get();


            if(notesSnapshot.empty){

                showEmpty();

                return;

            }


            const coursesSnapshot =
                await db
                    .collection("courses")
                    .get();


            const courseTitles = {};


            coursesSnapshot.forEach(function(doc){

                const course =
                    doc.data();


                if(course.courseCode){

                    courseTitles[
                        course.courseCode
                            .toString()
                            .trim()
                            .toUpperCase()
                    ] =
                        course.courseTitle || "";

                }

            });


            const grouped = {};


            notesSnapshot.forEach(function(doc){

                const note =
                    doc.data();


                if(!note.courseCode){

                    return;

                }


                const code =
                    note.courseCode
                        .toString()
                        .trim()
                        .toUpperCase();


                if(!grouped[code]){

                    grouped[code] = {

                        courseCode:
                            code,

                        courseTitle:
                            courseTitles[code] ||
                            "Course Notes",

                        lecturer:
                            note.lecturer ||
                            "Lecturer",

                        notes: [],

                        latestUpload:
                            note.uploadedAt ||
                            null

                    };

                }


                grouped[code].notes.push({

                    id:
                        doc.id,

                    topic:
                        note.topic ||
                        "Lecture Note",

                    lecturer:
                        note.lecturer ||
                        grouped[code].lecturer,

                    description:
                        note.description ||
                        "",

                    uploadedAt:
                        note.uploadedAt ||
                        null

                });


                if(note.lecturer){

                    grouped[code].lecturer =
                        note.lecturer;

                }

            });


            allCourses =
                Object.values(grouped);


            // ==================================
            // IMPORTANT
            // ONLY COURSES WITH NOTES
            // ==================================

            allCourses =
                allCourses.filter(function(course){

                    return (
                        course.notes &&
                        course.notes.length > 0
                    );

                });


            if(allCourses.length === 0){

                showEmpty();

                return;

            }


            renderCourses(allCourses);

        }

        catch(error){

            console.error(
                "Lecture Notes Error:",
                error
            );


            showMessage(
                "Unable to load lecture notes.",
                "fa-triangle-exclamation"
            );

        }

    }


    // ======================================
    // RENDER COURSES
    // ======================================

    function renderCourses(courses){

        courseList.innerHTML = "";


        if(courses.length === 0){

            showMessage(
                "No matching course found.",
                "fa-magnifying-glass"
            );

            return;

        }


        courses.forEach(function(course,index){

            const item =
                document.createElement("div");


            item.className =
                "course-item";


            item.style.animationDelay =
                `${index * 0.08}s`;


            const info =
                document.createElement("div");


            const code =
                document.createElement("h3");

            code.textContent =
                course.courseCode;


            const title =
                document.createElement("p");

            title.textContent =
                course.courseTitle;


            const small =
                document.createElement("small");


            small.textContent =
                `${course.lecturer} • ` +
                `${course.notes.length} Notes • ` +
                `Last Updated: ` +
                `${formatDate(course.latestUpload)}`;


            info.appendChild(code);

            info.appendChild(title);

            info.appendChild(small);


            const openButton =
                document.createElement("a");


            openButton.className =
                "open-btn";


            openButton.textContent =
                "Open";


            openButton.href =
                "lecture-notes-course.html" +
                "?course=" +
                encodeURIComponent(
                    course.courseCode
                );


            item.appendChild(info);

            item.appendChild(openButton);


            courseList.appendChild(item);

        });

    }


    // ======================================
    // SEARCH
    // ======================================

    if(searchInput){

        searchInput.addEventListener(
            "input",
            function(){

                const search =
                    this.value
                        .trim()
                        .toUpperCase();


                if(!search){

                    renderCourses(
                        allCourses
                    );

                    return;

                }


                const filtered =
                    allCourses.filter(function(course){

                        return (

                            course.courseCode
                                .toUpperCase()
                                .includes(search)

                            ||

                            course.courseTitle
                                .toUpperCase()
                                .includes(search)

                            ||

                            (
                                course.lecturer || ""
                            )
                                .toUpperCase()
                                .includes(search)

                        );

                    });


                renderCourses(filtered);

            }
        );

    }


    // ======================================
    // DATE
    // ======================================

    function formatDate(timestamp){

        if(!timestamp){

            return "--";

        }


        try{

            let date;


            if(
                timestamp &&
                typeof timestamp.toDate ===
                "function"
            ){

                date =
                    timestamp.toDate();

            }

            else if(timestamp.seconds){

                date =
                    new Date(
                        timestamp.seconds * 1000
                    );

            }

            else{

                date =
                    new Date(timestamp);

            }


            if(isNaN(date.getTime())){

                return "--";

            }


            return date.toLocaleDateString(
                "en-GB",
                {
                    day:"2-digit",
                    month:"short",
                    year:"numeric"
                }
            );

        }

        catch(error){

            return "--";

        }

    }


    // ======================================
    // LOADING
    // ======================================

    function showLoading(){

        courseList.innerHTML = `

            <div class="course-loading">

                <i class="
                    fa-solid
                    fa-spinner
                    fa-spin
                "></i>

                <p>
                    Loading lecture notes...
                </p>

            </div>

        `;

    }


    // ======================================
    // EMPTY
    // ======================================

    function showEmpty(){

        showMessage(
            "No lecture notes have been uploaded yet.",
            "fa-file-lines"
        );

    }


    // ======================================
    // MESSAGE
    // ======================================

    function showMessage(message,icon){

        courseList.innerHTML = `

            <div class="course-loading">

                <i class="
                    fa-solid
                    ${icon}
                "></i>

                <p>
                    ${message}
                </p>

            </div>

        `;

    }

});