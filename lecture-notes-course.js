// ==========================================
// L-TUTOR
// COURSE LECTURE NOTES
// CLOUDINARY + FIRESTORE
// VIEW + DOWNLOAD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function(){

        const params =
            new URLSearchParams(
                window.location.search
            );


        const courseCode =
            String(
                params.get("course") || ""
            )
            .trim()
            .toUpperCase();


        if(!courseCode){

            showErrorMessage(
                "No course was selected."
            );

            return;

        }


        loadCourseNotes(
            courseCode
        );

    }
);


// ==========================================
// LOAD COURSE NOTES
// ==========================================

async function loadCourseNotes(courseCode){

    const notesList =
        document.getElementById(
            "notesList"
        );


    if(!notesList){

        return;

    }


    try{

        const snapshot =
            await db
                .collection("lectureNotes")
                .where(
                    "courseCode",
                    "==",
                    courseCode
                )
                .get();


        if(snapshot.empty){

            showErrorMessage(
                "No lecture notes have been uploaded for this course yet."
            );

            return;

        }


        const notes = [];


        snapshot.forEach(function(doc){

            notes.push({

                id:doc.id,

                ...doc.data()

            });

        });


        notes.sort(function(a,b){

            return (
                getTimestamp(
                    b.uploadedAt
                )
                -
                getTimestamp(
                    a.uploadedAt
                )
            );

        });


        const codeElement =
            document.getElementById(
                "courseCode"
            );


        const titleElement =
            document.getElementById(
                "courseTitle"
            );


        const lecturerElement =
            document.getElementById(
                "courseLecturer"
            );


        const countElement =
            document.getElementById(
                "noteCount"
            );


        if(codeElement){

            codeElement.textContent =
                courseCode;

        }


        if(titleElement){

            titleElement.textContent =
                await getCourseTitle(
                    courseCode
                );

        }


        if(lecturerElement){

            lecturerElement.textContent =
                notes[0].lecturer ||
                "Lecturer";

        }


        if(countElement){

            countElement.textContent =
                `${notes.length} ${
                    notes.length === 1
                    ? "Note"
                    : "Notes"
                }`;

        }


        renderNotes(
            notes
        );

    }

    catch(error){

        console.error(
            "Course notes error:",
            error
        );


        showErrorMessage(
            "Unable to load course lecture notes."
        );

    }

}


// ==========================================
// COURSE TITLE
// ==========================================

async function getCourseTitle(courseCode){

    try{

        const snapshot =
            await db
                .collection("courses")
                .where(
                    "courseCode",
                    "==",
                    courseCode
                )
                .limit(1)
                .get();


        if(!snapshot.empty){

            const course =
                snapshot.docs[0].data();


            return (
                course.courseTitle ||
                course.title ||
                "Course Notes"
            );

        }

    }

    catch(error){

        console.error(
            "Course title error:",
            error
        );

    }


    return "Course Notes";

}


// ==========================================
// GET STORED CLOUDINARY URL
// ==========================================

function getNoteFileUrl(note){

    /*
       The admin upload now stores the exact
       Cloudinary secure_url in Firestore:

       note.fileUrl

       We use that URL directly.
    */


    if(
        note.fileUrl &&
        String(
            note.fileUrl
        ).trim() !== ""
    ){

        return String(
            note.fileUrl
        ).trim();

    }


    /*
       Compatibility with older records.
    */

    if(
        note.cloudinaryUrl &&
        String(
            note.cloudinaryUrl
        ).trim() !== ""
    ){

        return String(
            note.cloudinaryUrl
        ).trim();

    }


    if(
        note.url &&
        String(
            note.url
        ).trim() !== ""
    ){

        return String(
            note.url
        ).trim();

    }


    return "";

}


// ==========================================
// RENDER NOTES
// ==========================================

function renderNotes(notes){

    const notesList =
        document.getElementById(
            "notesList"
        );


    if(!notesList){

        return;

    }


    notesList.innerHTML = "";


    notes.forEach(function(note,index){

        const card =
            document.createElement(
                "article"
            );


        card.className =
            "note-card";


        card.style.animationDelay =
            `${index * 0.08}s`;


        const fileUrl =
            getNoteFileUrl(
                note
            );


        const fileIcon =
            getFileIcon(
                note.fileType,
                note.fileName
            );


        card.innerHTML = `

            <div class="note-icon">

                <i class="${fileIcon}"></i>

            </div>


            <div class="note-content">

                <h3>

                    ${escapeText(
                        note.topic ||
                        "Lecture Note"
                    )}

                </h3>


                <p class="note-description">

                    ${escapeText(
                        note.description ||
                        "Lecture material"
                    )}

                </p>


                <div class="note-meta">

                    <span>

                        <i class="
                            fa-solid
                            fa-user
                        "></i>

                        ${escapeText(
                            note.lecturer ||
                            "Lecturer"
                        )}

                    </span>


                    <span>

                        <i class="
                            fa-solid
                            fa-calendar
                        "></i>

                        ${formatDate(
                            note.uploadedAt
                        )}

                    </span>


                    ${
                        note.fileName
                        ?
                        `

                        <span>

                            <i class="
                                fa-solid
                                fa-file
                            "></i>

                            ${escapeText(
                                note.fileName
                            )}

                        </span>

                        `
                        :
                        ""
                    }

                </div>


                <div class="note-actions">

                    ${
                        fileUrl

                        ?

                        `

                        <a
                            href="${escapeAttribute(
                                fileUrl
                            )}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="view-btn"
                        >

                            <i class="
                                fa-solid
                                fa-eye
                            "></i>

                            View

                        </a>


                        <a
                            href="${escapeAttribute(
                                fileUrl
                            )}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="download-btn"
                            download
                        >

                            <i class="
                                fa-solid
                                fa-download
                            "></i>

                            Download

                        </a>

                        `

                        :

                        `

                        <span
                            class="unavailable-btn"
                        >

                            <i class="
                                fa-solid
                                fa-circle-exclamation
                            "></i>

                            File unavailable

                        </span>

                        `

                    }

                </div>

            </div>

        `;


        notesList.appendChild(
            card
        );

    });

}


// ==========================================
// FILE ICON
// ==========================================

function getFileIcon(type,name){

    const value =
        String(
            type ||
            name ||
            ""
        )
        .toLowerCase();


    if(
        value.includes("pdf")
    ){

        return "fa-solid fa-file-pdf";

    }


    if(
        value.includes("word") ||
        value.includes("doc")
    ){

        return "fa-solid fa-file-word";

    }


    return "fa-solid fa-file-lines";

}


// ==========================================
// TIMESTAMP
// ==========================================

function getTimestamp(timestamp){

    if(!timestamp){

        return 0;

    }


    if(
        typeof timestamp.toDate ===
        "function"
    ){

        return timestamp
            .toDate()
            .getTime();

    }


    if(
        timestamp.seconds !==
        undefined
    ){

        return (
            Number(
                timestamp.seconds
            ) * 1000
        );

    }


    const date =
        new Date(
            timestamp
        );


    const time =
        date.getTime();


    return isNaN(time)
        ? 0
        : time;

}


// ==========================================
// DATE
// ==========================================

function formatDate(timestamp){

    const time =
        getTimestamp(
            timestamp
        );


    if(!time){

        return "--";

    }


    return new Date(time)
        .toLocaleDateString(
            "en-GB",
            {
                day:"2-digit",
                month:"short",
                year:"numeric"
            }
        );

}


// ==========================================
// ERROR
// ==========================================

function showErrorMessage(message){

    const list =
        document.getElementById(
            "notesList"
        );


    if(!list){

        return;

    }


    list.innerHTML = `

        <div class="
            loading-box
            error-box
        ">

            <i class="
                fa-solid
                fa-file-circle-exclamation
            "></i>


            <p>

                ${escapeText(
                    message
                )}

            </p>


            <a
                href="lecture-notes.html"
                class="back-course-btn"
            >

                <i class="
                    fa-solid
                    fa-arrow-left
                "></i>

                Back to Lecture Notes

            </a>

        </div>

    `;

}


// ==========================================
// SAFE TEXT
// ==========================================

function escapeText(value){

    return String(
        value || ""
    )
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
// SAFE ATTRIBUTE
// ==========================================

function escapeAttribute(value){

    return String(
        value || ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    );

}