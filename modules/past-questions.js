// ======================================
// L-TUTOR
// ADMIN PAST QUESTIONS MODULE
// v5.0
// FIRESTORE + CLOUDINARY
// SAME FILE SYSTEM AS LECTURE NOTES
// ======================================


// ======================================
// EDITING STATE
// ======================================

let editingPastQuestion = false;
let editingPastQuestionId = null;


// ======================================
// LOAD MODULE
// ======================================

function loadPastQuestionsModule(){

    pageTitle.innerHTML =
        "Past Questions";

    pageSubtitle.innerHTML =
        "Upload and manage departmental past questions.";


    editingPastQuestion = false;
    editingPastQuestionId = null;


    contentArea.innerHTML = `

        <!-- =================================
             UPLOAD PANEL
        ================================== -->

        <div class="panel">

            <h2>

                <i class="
                    fa-solid
                    fa-file-circle-question
                "></i>

                Upload Past Question

            </h2>


            <div class="form-grid">

                <div class="form-group">

                    <label>
                        Course
                    </label>

                    <select id="pastCourse">

                        <option value="">
                            Loading Courses...
                        </option>

                    </select>

                </div>


                <div class="form-group">

                    <label>
                        Academic Year
                    </label>

                    <input
                        type="text"
                        id="pastYear"
                        placeholder="2024/2025"
                    >

                </div>


                <div class="form-group">

                    <label>
                        Semester
                    </label>

                    <select id="pastSemester">

                        <option value="">
                            Select Semester
                        </option>

                        <option value="First Semester">
                            First Semester
                        </option>

                        <option value="Second Semester">
                            Second Semester
                        </option>

                    </select>

                </div>


                <div class="form-group">

                    <label>
                        Description
                    </label>

                    <textarea
                        id="pastDescription"
                        placeholder="Brief description..."
                    ></textarea>

                </div>

            </div>


            <!-- =================================
                 FILE
            ================================== -->

            <div class="form-group">

                <label>
                    Past Question File
                </label>


                <label class="upload-box">

       <input
    type="file"
    id="pastFile"
    accept=".pdf,.doc,.docx,image/*"
   
           onchange="previewSelectedFile(this,'pastPreview')">
                    


                    <i class="
                        fa-solid
                        fa-file-arrow-up
                    "></i>


                    <h4>
                        Upload PDF / DOCX
                    </h4>


                    <p>
                        Click here to choose file
                    </p>

                </label>


                <div
                    id="pastPreview"
                    class="upload-preview"
                ></div>


                <div
                    id="pastUploadStatus"
                    class="upload-success"
                    style="display:none;"
                ></div>

            </div>


            <!-- =================================
                 SAVE
            ================================== -->

            <button
                class="save-btn"
                id="savePastBtn"
                onclick="savePastQuestion()"
            >

                <i class="
                    fa-solid
                    fa-cloud-arrow-up
                "></i>

                Upload Past Question

            </button>

        </div>


        <!-- =================================
             UPLOADED QUESTIONS
        ================================== -->

        <div class="panel">

            <h2>

                <i class="
                    fa-solid
                    fa-folder-open
                "></i>

                Uploaded Past Questions

            </h2>


            <div class="search-box">

                <i class="
                    fa-solid
                    fa-magnifying-glass
                "></i>

                <input
                    type="text"
                    id="pastSearch"
                    placeholder="Search Past Questions..."
                    onkeyup="
                        searchPastQuestions()
                    "
                >

            </div>


            <div class="table-wrapper">

                <table>

                    <thead>

                        <tr>

                            <th>
                                Course
                            </th>

                            <th>
                                Year
                            </th>

                            <th>
                                Semester
                            </th>

                            <th>
                                File
                            </th>

                            <th>
                                Actions
                            </th>

                        </tr>

                    </thead>


                    <tbody id="pastTable">

                        <tr>

                            <td colspan="5">
                                Loading...
                            </td>

                        </tr>

                    </tbody>

                </table>

            </div>

        </div>

    `;


    loadPastCourseDropdown();

    loadPastQuestions();

}


// ======================================
// COURSE DROPDOWN
// ======================================

function loadPastCourseDropdown(){

    const dropdown =
        document.getElementById(
            "pastCourse"
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


                const code =
                    String(
                        course.courseCode
                    )
                    .trim()
                    .toUpperCase();


                const title =
                    course.courseTitle ||
                    course.title ||
                    course.name ||
                    "";


                dropdown.innerHTML += `

                    <option
                        value="${escapeAdminPastAttribute(code)}"
                    >

                        ${escapeAdminPastText(code)}

                        ${
                            title
                            ? " - " +
                              escapeAdminPastText(title)
                            : ""
                        }

                    </option>

                `;

            });

        })

        .catch(function(error){

            console.error(
                "Past course dropdown error:",
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
// LOAD PAST QUESTIONS
// ======================================

function loadPastQuestions(){

    const table =
        document.getElementById(
            "pastTable"
        );


    if(!table){

        return;

    }


    table.innerHTML = `

        <tr>

            <td colspan="5">
                Loading...
            </td>

        </tr>

    `;


    pastQuestionsRef
        .orderBy("uploadedAt", "desc")
        .get()

        .then(function(snapshot){

            table.innerHTML = "";


            if(snapshot.empty){

                table.innerHTML = `

                    <tr>

                        <td colspan="5">

                            No Past Questions Uploaded.

                        </td>

                    </tr>

                `;

                return;

            }


            snapshot.forEach(function(doc){

                const past =
                    doc.data();


                const fileName =
                    past.fileName ||
                    "No file";


                table.innerHTML += `

                    <tr>

                        <td>

                            ${escapeAdminPastText(
                                past.courseCode ||
                                "—"
                            )}

                        </td>


                        <td>

                            ${escapeAdminPastText(
                                past.year ||
                                "—"
                            )}

                        </td>


                        <td>

                            ${escapeAdminPastText(
                                past.semester ||
                                "—"
                            )}

                        </td>


                        <td>

                            <span class="file-name">

                                <i class="
                                    fa-solid
                                    fa-file-pdf
                                "></i>

                                ${escapeAdminPastText(
                                    fileName
                                )}

                            </span>

                        </td>


                        <td>

                            ${
                                (past.fileUrl || past.fileURL)
                                ? `
                                    <button
                                        class="table-preview-btn"
                                        onclick="previewAdminFile('${escapeAdminPastAttribute(past.fileUrl || past.fileURL)}','${escapeAdminPastAttribute(past.fileName || 'Past Question')}','pdf')"
                                    >
                                        <i class="fa-solid fa-eye"></i>
                                        Preview
                                    </button>
                                  `
                                : ""
                            }

                            <button
                                class="edit-btn"
                                onclick="
                                    editPastQuestion(
                                        '${doc.id}'
                                    )
                                "
                            >

                                <i class="
                                    fa-solid
                                    fa-pen
                                "></i>

                                Edit

                            </button>


                            <button
                                class="delete-btn"
                                onclick="
                                    deletePastQuestion(
                                        '${doc.id}'
                                    )
                                "
                            >

                                <i class="
                                    fa-solid
                                    fa-trash
                                "></i>

                                Delete

                            </button>

                        </td>

                    </tr>

                `;

            });

        })

        .catch(function(error){

            console.error(
                "Past questions load error:",
                error
            );


            table.innerHTML = `

                <tr>

                    <td colspan="5">

                        ${escapeAdminPastText(
                            error.message
                        )}

                    </td>

                </tr>

            `;

        });

}


// ======================================
// SAVE PAST QUESTION
// ======================================

async function savePastQuestion(){

    const course =
        document.getElementById(
            "pastCourse"
        );


    const year =
        document.getElementById(
            "pastYear"
        );


    const semester =
        document.getElementById(
            "pastSemester"
        );


    const description =
        document.getElementById(
            "pastDescription"
        );


    const fileInput =
        document.getElementById(
            "pastFile"
        );


    const button =
        document.getElementById(
            "savePastBtn"
        );


    if(
        !course ||
        !year ||
        !semester ||
        !description ||
        !button
    ){

        showError(
            "Past Question form could not be loaded."
        );

        return;

    }


    const courseCode =
        course.value
            .trim()
            .toUpperCase();


    const academicYear =
        year.value.trim();


    const selectedSemester =
        semester.value;


    const questionDescription =
        description.value.trim();


    const file =
        fileInput &&
        fileInput.files.length
        ? fileInput.files[0]
        : null;


    // ======================================
    // VALIDATION
    // ======================================

    if(!courseCode){

        showWarning(
            "Please select a course."
        );

        return;

    }


    if(!academicYear){

        showWarning(
            "Please enter the academic year."
        );

        return;

    }


    if(!selectedSemester){

        showWarning(
            "Please select a semester."
        );

        return;

    }


    if(
        !editingPastQuestion &&
        !file
    ){

        showWarning(
            "Please select a past question file."
        );

        return;

    }


    // ======================================
    // FILE VALIDATION
    // ======================================

    if(file){

        const extension =
            file.name
                .split(".")
                .pop()
                .toLowerCase();


        const allowedExtensions = [
            "pdf",
            "doc",
            "docx"
        ];


        if(
            !allowedExtensions.includes(
                extension
            )
        ){

            showWarning(
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
                editingPastQuestion
                ? "Updating..."
                : "Uploading..."
            }

        `;


        let fileData = null;


        // ======================================
        // UPLOAD FILE
        // SAME uploadFile() USED BY
        // LECTURE NOTES
        // ======================================

        if(file){

            fileData =
                await uploadFile(
                    file
                );


            if(
                !fileData ||
                !fileData.url
            ){

                throw new Error(
                    "The file uploaded but no file URL was returned."
                );

            }

        }


        // ======================================
        // FIRESTORE DATA
        // ======================================

        const pastData = {

            courseCode:
                courseCode,

            year:
                academicYear,

            semester:
                selectedSemester,

            description:
                questionDescription,

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        };


        // ======================================
        // NEW FILE
        //
        // IMPORTANT:
        // USE fileUrl
        // SAME AS LECTURE NOTES
        // ======================================

        if(fileData){

            pastData.fileUrl =
                String(
                    fileData.url
                ).trim();


            pastData.fileName =
                fileData.originalName ||
                file.name;


            pastData.fileType =
                fileData.type ||
                file.type;


            pastData.fileSize =
                fileData.size ||
                file.size;


            pastData.cloudinaryPublicId =
                fileData.publicId ||
                "";


            pastData.cloudinaryResourceType =
                fileData.resourceType ||
                "raw";

        }


        // ======================================
        // UPDATE EXISTING
        // ======================================

        if(editingPastQuestion){

            if(!fileData){

                const oldDoc =
                    await pastQuestionsRef
                        .doc(
                            editingPastQuestionId
                        )
                        .get();


                if(!oldDoc.exists){

                    throw new Error(
                        "Past Question no longer exists."
                    );

                }


                const oldData =
                    oldDoc.data();


                // --------------------------------
                // SUPPORT OLD RECORDS
                // --------------------------------

                pastData.fileUrl =
                    oldData.fileUrl ||
                    oldData.fileURL ||
                    oldData.cloudinaryUrl ||
                    oldData.url ||
                    "";


                pastData.fileName =
                    oldData.fileName ||
                    "";


                pastData.fileType =
                    oldData.fileType ||
                    "";


                pastData.fileSize =
                    oldData.fileSize ||
                    0;


                pastData.cloudinaryPublicId =
                    oldData.cloudinaryPublicId ||
                    "";


                pastData.cloudinaryResourceType =
                    oldData.cloudinaryResourceType ||
                    "raw";

            }


            await pastQuestionsRef
                .doc(
                    editingPastQuestionId
                )
                .update(
                    pastData
                );


            showSuccess(
                "Past Question Updated Successfully."
            );

        }


        // ======================================
        // NEW RECORD
        // ======================================

        else{

            pastData.uploadedAt =
                firebase.firestore
                    .FieldValue
                    .serverTimestamp();


            await pastQuestionsRef.add(
                pastData
            );


            showSuccess(
                "Past Question Uploaded Successfully."
            );

        }


        // ======================================
        // RESET
        // ======================================

        editingPastQuestion =
            false;


        editingPastQuestionId =
            null;


        if(fileInput){

            fileInput.value = "";

        }


        year.value = "";

        description.value = "";

        semester.value = "";


        const preview =
            document.getElementById(
                "pastPreview"
            );


        if(preview){

            preview.innerHTML = "";

            preview.style.display =
                "none";

        }


        const status =
            document.getElementById(
                "pastUploadStatus"
            );


        if(status){

            status.innerHTML = "";

            status.style.display =
                "none";

        }


        button.disabled =
            false;


        button.innerHTML = `

            <i class="
                fa-solid
                fa-cloud-arrow-up
            "></i>

            Upload Past Question

        `;


        loadPastQuestions();

    }


    catch(error){

        console.error(
            "Past Question upload error:",
            error
        );


        button.disabled =
            false;


        button.innerHTML = `

            <i class="
                fa-solid
                fa-cloud-arrow-up
            "></i>

            Upload Past Question

        `;


        showError(
            error.message ||
            "Unable to upload past question."
        );

    }

}


// ======================================
// EDIT
// ======================================

function editPastQuestion(id){

    pastQuestionsRef
        .doc(id)
        .get()

        .then(function(doc){

            if(!doc.exists){

                showError(
                    "Past Question not found."
                );

                return;

            }


            const past =
                doc.data();


            editingPastQuestion =
                true;


            editingPastQuestionId =
                id;


            document.getElementById(
                "pastCourse"
            ).value =
                past.courseCode ||
                "";


            document.getElementById(
                "pastYear"
            ).value =
                past.year ||
                "";


            document.getElementById(
                "pastSemester"
            ).value =
                past.semester ||
                "";


            document.getElementById(
                "pastDescription"
            ).value =
                past.description ||
                "";


            const button =
                document.getElementById(
                    "savePastBtn"
                );


            if(button){

                button.innerHTML = `

                    <i class="
                        fa-solid
                        fa-pen
                    "></i>

                    Update Past Question

                `;

            }


            showSuccess(
                "Past Question loaded."
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

function deletePastQuestion(id){

    showConfirm(

        "Delete Past Question",

        "Are you sure you want to delete this past question?"

    )

    .then(function(result){

        if(!result.isConfirmed){

            return;

        }


        pastQuestionsRef
            .doc(id)
            .delete()

            .then(function(){

                showSuccess(
                    "Past Question Deleted Successfully."
                );


                loadPastQuestions();

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

function searchPastQuestions(){

    const input =
        document.getElementById(
            "pastSearch"
        );


    if(!input){

        return;

    }


    const search =
        input.value
            .trim()
            .toUpperCase();


    const rows =
        document.querySelectorAll(
            "#pastTable tr"
        );


    rows.forEach(function(row){

        const text =
            row.innerText
                .toUpperCase();


        row.style.display =
            text.includes(search)
            ? ""
            : "none";

    });

}


// ======================================
// SAFE TEXT
// ======================================

function escapeAdminPastText(
    value
){

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


// ======================================
// SAFE ATTRIBUTE
// ======================================

function escapeAdminPastAttribute(
    value
){

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