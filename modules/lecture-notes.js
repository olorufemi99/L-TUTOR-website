// ======================================
// L-TUTOR
// LECTURE NOTES MODULE
// ADMIN UPLOAD / EDIT / DELETE
// CLOUDINARY + FIRESTORE
// ======================================

let editingLectureNote = false;
let editingLectureNoteId = null;


// ======================================
// LOAD MODULE
// ======================================

function loadLectureNotesModule(){

    pageTitle.innerHTML =
        "Lecture Notes";


    pageSubtitle.innerHTML =
        "Upload, organize and manage lecture notes.";


    editingLectureNote = false;

    editingLectureNoteId = null;


    contentArea.innerHTML = `

        <div class="panel">

            <h2>

                <i class="fa-solid fa-file-lines"></i>

                Upload Lecture Note

            </h2>


            <div class="form-grid">

                <div class="form-group">

                    <label>
                        Course
                    </label>


                    <select id="noteCourse">

                        <option value="">
                            Loading Courses...
                        </option>

                    </select>

                </div>


                <div class="form-group">

                    <label>
                        Lecture Topic
                    </label>


                    <input
                        type="text"
                        id="noteTopic"
                        placeholder="Week 1 - Introduction"
                    >

                </div>


                <div class="form-group">

                    <label>
                        Lecturer
                    </label>


                    <input
                        type="text"
                        id="noteLecturer"
                        placeholder="Dr. R. A. Okewale"
                    >

                </div>


                <div class="form-group">

                    <label>
                        Description
                    </label>


                    <textarea
                        id="noteDescription"
                        placeholder="Brief description of this lecture note..."
                    ></textarea>

                </div>

            </div>


            <div class="form-group">

                <label>
                    Lecture Note File
                </label>


                <label class="upload-box">

                    <input
                        type="file"
                        id="noteFile"
                        accept=".pdf,.doc,.docx,image/*"
                        onchange="previewSelectedFile(this,'notePreview')"
                    >


                    <i class="fa-solid fa-file-arrow-up"></i>


                    <h4>
                        Upload PDF / DOCX
                    </h4>


                    <p>
                        Click to select your lecture note
                    </p>

                </label>


                <div
                    id="notePreview"
                    class="upload-preview"
                ></div>


                <div
                    id="noteUploadStatus"
                    class="upload-success"
                    style="display:none;"
                ></div>

            </div>


            <button
                class="save-btn"
                id="saveLectureNoteBtn"
                onclick="saveLectureNote()"
            >

                <i class="fa-solid fa-cloud-arrow-up"></i>

                Upload Lecture Note

            </button>

        </div>


        <div class="panel">

            <h2>

                <i class="fa-solid fa-folder-open"></i>

                Uploaded Lecture Notes

            </h2>


            <div class="search-box">

                <i class="fa-solid fa-magnifying-glass"></i>


                <input
                    type="text"
                    id="lectureNoteSearch"
                    placeholder="Search lecture notes..."
                    onkeyup="searchLectureNotes()"
                >

            </div>


            <table>

                <thead>

                    <tr>

                        <th>
                            Course
                        </th>

                        <th>
                            Topic
                        </th>

                        <th>
                            Lecturer
                        </th>

                        <th>
                            Uploaded
                        </th>

                        <th>
                            Actions
                        </th>

                    </tr>

                </thead>


                <tbody id="lectureNoteTable">

                    <tr>

                        <td colspan="5">
                            Loading Lecture Notes...
                        </td>

                    </tr>

                </tbody>

            </table>

        </div>

    `;


    loadCourseDropdown();

    loadLectureNotes();

}


// ======================================
// LOAD COURSE DROPDOWN
// ======================================

function loadCourseDropdown(){

    const dropdown =
        document.getElementById(
            "noteCourse"
        );


    if(!dropdown){

        return;

    }


    dropdown.innerHTML = `

        <option value="">
            Select Course
        </option>

    `;


    coursesRef
        .orderBy("courseCode")
        .get()

        .then(function(snapshot){

            if(snapshot.empty){

                dropdown.innerHTML = `

                    <option value="">
                        No Courses Available
                    </option>

                `;

                return;

            }


            snapshot.forEach(function(doc){

                const course =
                    doc.data();


                if(!course.courseCode){

                    return;

                }


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    String(
                        course.courseCode
                    )
                    .trim()
                    .toUpperCase();


                option.textContent =
                    `${course.courseCode} - ${
                        course.courseTitle || ""
                    }`;


                dropdown.appendChild(
                    option
                );

            });

        })

        .catch(function(error){

            console.error(
                "Course dropdown error:",
                error
            );


            dropdown.innerHTML = `

                <option value="">
                    Unable to Load Courses
                </option>

            `;

        });

}


// ======================================
// SAVE / UPDATE
// ======================================

async function saveLectureNote(){

    const course =
        document.getElementById(
            "noteCourse"
        );


    const topic =
        document.getElementById(
            "noteTopic"
        );


    const lecturer =
        document.getElementById(
            "noteLecturer"
        );


    const description =
        document.getElementById(
            "noteDescription"
        );


    const fileInput =
        document.getElementById(
            "noteFile"
        );


    const button =
        document.getElementById(
            "saveLectureNoteBtn"
        );


    if(
        !course ||
        !topic ||
        !lecturer ||
        !description ||
        !button
    ){

        showError(
            "Lecture note form could not be loaded."
        );

        return;

    }


    const courseCode =
        course.value
            .trim()
            .toUpperCase();


    const lectureTopic =
        topic.value.trim();


    const lecturerName =
        lecturer.value.trim();


    const lectureDescription =
        description.value.trim();


    let selectedFile = null;


    if(
        fileInput &&
        fileInput.files.length > 0
    ){

        selectedFile =
            fileInput.files[0];

    }


    // ==================================
    // VALIDATION
    // ==================================

    if(!courseCode){

        showError(
            "Please select a course."
        );

        return;

    }


    if(!lectureTopic){

        showError(
            "Please enter the lecture topic."
        );

        return;

    }


    if(!lecturerName){

        showError(
            "Please enter the lecturer's name."
        );

        return;

    }


    if(
        !editingLectureNote &&
        !selectedFile
    ){

        showError(
            "Please select a lecture note file."
        );

        return;

    }


    // ==================================
    // FILE VALIDATION
    // ==================================

    if(selectedFile){

        const allowedTypes = [

            "application/pdf",

            "application/msword",

            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

        ];


        if(
            !allowedTypes.includes(
                selectedFile.type
            )
        ){

            showError(
                "Only PDF, DOC and DOCX files are allowed."
            );

            return;

        }

    }


    try{

        button.disabled = true;


        button.innerHTML = `

            <i class="
                fa-solid
                fa-spinner
                fa-spin
            "></i>

            ${
                editingLectureNote
                ? "Updating..."
                : "Uploading..."
            }

        `;


        let fileData = null;


        // ==================================
        // CLOUDINARY UPLOAD
        // ==================================

        if(selectedFile){

            fileData =
                await uploadFile(
                    selectedFile
                );


            // ==================================
            // VERY IMPORTANT
            // ==================================

            if(
                !fileData ||
                !fileData.url
            ){

                throw new Error(
                    "Cloudinary upload completed but no file URL was returned."
                );

            }

        }


        // ==================================
        // FIRESTORE DATA
        // ==================================

        const noteData = {

            courseCode:
                courseCode,

            topic:
                lectureTopic,

            lecturer:
                lecturerName,

            description:
                lectureDescription,

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        };


        // ==================================
        // NEW NOTE
        // ==================================

        if(!editingLectureNote){

            if(!fileData){

                throw new Error(
                    "No uploaded Cloudinary file was returned."
                );

            }


            noteData.uploadedAt =
                firebase.firestore
                    .FieldValue
                    .serverTimestamp();


            noteData.fileUrl =
                String(
                    fileData.url
                ).trim();


            noteData.fileName =
                fileData.originalName ||
                selectedFile.name;


            noteData.fileType =
                fileData.type ||
                selectedFile.type;


            noteData.fileSize =
                fileData.size ||
                selectedFile.size;


            noteData.cloudinaryPublicId =
                fileData.publicId ||
                "";


            noteData.cloudinaryResourceType =
                fileData.resourceType ||
                "raw";


            // ==================================
            // SAVE TO FIRESTORE
            // ==================================

            await lectureNotesRef.add(
                noteData
            );


            console.log(
                "Lecture note saved:",
                noteData
            );


            showSuccess(
                "Lecture Note Uploaded Successfully."
            );

        }


        // ==================================
        // UPDATE
        // ==================================

        else{

            if(fileData){

                noteData.fileUrl =
                    String(
                        fileData.url
                    ).trim();


                noteData.fileName =
                    fileData.originalName ||
                    selectedFile.name;


                noteData.fileType =
                    fileData.type ||
                    selectedFile.type;


                noteData.fileSize =
                    fileData.size ||
                    selectedFile.size;


                noteData.cloudinaryPublicId =
                    fileData.publicId ||
                    "";


                noteData.cloudinaryResourceType =
                    fileData.resourceType ||
                    "raw";

            }


            await lectureNotesRef
                .doc(editingLectureNoteId)
                .update(noteData);


            showSuccess(
                "Lecture Note Updated Successfully."
            );

        }


        resetLectureNoteForm();

        loadLectureNotes();

    }


    catch(error){

        console.error(
            "Lecture note save error:",
            error
        );


        showError(
            error.message ||
            "Unable to save lecture note."
        );

    }


    finally{

        button.disabled = false;


        button.innerHTML = `

            <i class="
                fa-solid
                fa-cloud-arrow-up
            "></i>

            Upload Lecture Note

        `;

    }

}


// ======================================
// LOAD NOTES
// ======================================

function loadLectureNotes(){

    const table =
        document.getElementById(
            "lectureNoteTable"
        );


    if(!table){

        return;

    }


    table.innerHTML = `

        <tr>

            <td colspan="5">
                Loading Lecture Notes...
            </td>

        </tr>

    `;


    lectureNotesRef
        .orderBy(
            "uploadedAt",
            "desc"
        )
        .get()

        .then(function(snapshot){

            table.innerHTML = "";


            if(snapshot.empty){

                table.innerHTML = `

                    <tr>

                        <td colspan="5">
                            No Lecture Notes Uploaded.
                        </td>

                    </tr>

                `;

                return;

            }


            snapshot.forEach(function(doc){

                const note =
                    doc.data();


                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>
                        ${escapeLectureText(
                            note.courseCode || "--"
                        )}
                    </td>

                    <td>
                        ${escapeLectureText(
                            note.topic || "--"
                        )}
                    </td>

                    <td>
                        ${escapeLectureText(
                            note.lecturer || "--"
                        )}
                    </td>

                    <td>
                        ${formatLectureNoteDate(
                            note.uploadedAt
                        )}
                    </td>

                    <td>

                        <button
                            class="edit-btn"
                            onclick="editLectureNote('${doc.id}')"
                        >

                            <i class="
                                fa-solid
                                fa-pen
                            "></i>

                            Edit

                        </button>


                        <button
                            class="delete-btn"
                            onclick="deleteLectureNote('${doc.id}')"
                        >

                            <i class="
                                fa-solid
                                fa-trash
                            "></i>

                            Delete

                        </button>

                    </td>

                `;


                table.appendChild(
                    row
                );

            });

        })

        .catch(function(error){

            console.error(
                "Lecture note loading error:",
                error
            );


            table.innerHTML = `

                <tr>

                    <td colspan="5">

                        ${escapeLectureText(
                            error.message
                        )}

                    </td>

                </tr>

            `;

        });

}


// ======================================
// EDIT
// ======================================

function editLectureNote(id){

    lectureNotesRef
        .doc(id)
        .get()

        .then(function(doc){

            if(!doc.exists){

                showError(
                    "Lecture note no longer exists."
                );

                return;

            }


            const note =
                doc.data();


            editingLectureNote = true;

            editingLectureNoteId = id;


            document.getElementById(
                "noteCourse"
            ).value =
                note.courseCode || "";


            document.getElementById(
                "noteTopic"
            ).value =
                note.topic || "";


            document.getElementById(
                "noteLecturer"
            ).value =
                note.lecturer || "";


            document.getElementById(
                "noteDescription"
            ).value =
                note.description || "";


            const button =
                document.getElementById(
                    "saveLectureNoteBtn"
                );


            if(button){

                button.innerHTML = `

                    <i class="
                        fa-solid
                        fa-pen
                    "></i>

                    Update Lecture Note

                `;

            }


            const preview =
                document.getElementById(
                    "notePreview"
                );


            if(preview){

                preview.style.display =
                    "block";


                preview.innerHTML = `

                    <i class="
                        fa-solid
                        fa-file-lines
                    "></i>

                    <br>

                    <strong>

                        ${escapeLectureText(
                            note.fileName ||
                            "Existing lecture note"
                        )}

                    </strong>

                    <br>

                    <small>
                        Existing file will remain
                        unless you select a new file.
                    </small>

                `;

            }


            window.scrollTo({
                top:0,
                behavior:"smooth"
            });


            showSuccess(
                "Lecture Note loaded for editing."
            );

        })

        .catch(function(error){

            showError(
                error.message
            );

        });

}


// ======================================
// DELETE
// ======================================

function deleteLectureNote(id){

    showConfirm(

        "Delete Lecture Note",

        "Are you sure you want to delete this lecture note?"

    )

    .then(function(result){

        if(!result.isConfirmed){

            return;

        }


        lectureNotesRef
            .doc(id)
            .delete()

            .then(function(){

                showSuccess(
                    "Lecture Note Deleted Successfully."
                );


                loadLectureNotes();

            })

            .catch(function(error){

                showError(
                    error.message
                );

            });

    });

}


// ======================================
// SEARCH
// ======================================

function searchLectureNotes(){

    const input =
        document.getElementById(
            "lectureNoteSearch"
        );


    if(!input){

        return;

    }


    const search =
        input.value
            .trim()
            .toUpperCase();


    document
        .querySelectorAll(
            "#lectureNoteTable tr"
        )
        .forEach(function(row){

            row.style.display =
                row.innerText
                    .toUpperCase()
                    .includes(search)
                ? ""
                : "none";

        });

}


// ======================================
// RESET
// ======================================

function resetLectureNoteForm(){

    editingLectureNote = false;

    editingLectureNoteId = null;


    const course =
        document.getElementById(
            "noteCourse"
        );


    const topic =
        document.getElementById(
            "noteTopic"
        );


    const lecturer =
        document.getElementById(
            "noteLecturer"
        );


    const description =
        document.getElementById(
            "noteDescription"
        );


    const file =
        document.getElementById(
            "noteFile"
        );


    const preview =
        document.getElementById(
            "notePreview"
        );


    const status =
        document.getElementById(
            "noteUploadStatus"
        );


    if(course){

        course.value = "";

    }


    if(topic){

        topic.value = "";

    }


    if(lecturer){

        lecturer.value = "";

    }


    if(description){

        description.value = "";

    }


    if(file){

        file.value = "";

    }


    if(preview){

        preview.innerHTML = "";

        preview.style.display =
            "none";

    }


    if(status){

        status.innerHTML = "";

        status.style.display =
            "none";

    }

}


// ======================================
// DATE
// ======================================

function formatLectureNoteDate(timestamp){

    if(!timestamp){

        return "--";

    }


    let time = 0;


    if(
        typeof timestamp.toDate ===
        "function"
    ){

        time =
            timestamp
                .toDate()
                .getTime();

    }

    else if(
        timestamp.seconds !==
        undefined
    ){

        time =
            Number(
                timestamp.seconds
            ) * 1000;

    }

    else{

        time =
            new Date(
                timestamp
            ).getTime();

    }


    if(!time || isNaN(time)){

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


// ======================================
// SAFE TEXT
// ======================================

function escapeLectureText(value){

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