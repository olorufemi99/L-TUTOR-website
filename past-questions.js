// ======================================
// L-TUTOR
// STUDENT PAST QUESTIONS
// v6.0
// PDF + DOC + DOCX + IMAGES
// CLOUDINARY DOWNLOAD FIX
// ======================================

let allPastQuestions = [];


// ======================================
// PAGE READY
// ======================================

document.addEventListener("DOMContentLoaded", function () {

    const container =
        document.getElementById("pastQuestionsContainer");

    if (!container) {
        console.error(
            "pastQuestionsContainer not found."
        );
        return;
    }

    loadPastQuestions();

});


// ======================================
// LOAD PAST QUESTIONS
// ======================================

async function loadPastQuestions() {

    const container =
        document.getElementById(
            "pastQuestionsContainer"
        );

    if (!container) return;


    container.innerHTML = `

        <div class="empty-books">

            <i class="fa-solid fa-spinner fa-spin"></i>

            <p>
                Loading past questions...
            </p>

        </div>

    `;


    try {

        const snapshot =
            await db
                .collection("pastQuestions")
                .orderBy(
                    "uploadedAt",
                    "desc"
                )
                .get();


        allPastQuestions = [];


        snapshot.forEach(function (doc) {

            allPastQuestions.push({

                id: doc.id,

                ...doc.data()

            });

        });


        displayPastQuestions(
            allPastQuestions
        );

    }

    catch (error) {

        console.error(
            "Past Questions Error:",
            error
        );


        container.innerHTML = `

            <div class="empty-books">

                <i class="
                    fa-solid
                    fa-circle-exclamation
                "></i>

                <h3>
                    Unable to load past questions
                </h3>

                <p>
                    Please try again later.
                </p>

            </div>

        `;

    }

}


// ======================================
// GET ORIGINAL FILE URL
// ======================================

function getPastQuestionFileUrl(item) {

    if (
        item.fileURL &&
        String(item.fileURL).trim()
    ) {

        return String(
            item.fileURL
        ).trim();

    }


    if (
        item.fileUrl &&
        String(item.fileUrl).trim()
    ) {

        return String(
            item.fileUrl
        ).trim();

    }


    if (
        item.cloudinaryUrl &&
        String(item.cloudinaryUrl).trim()
    ) {

        return String(
            item.cloudinaryUrl
        ).trim();

    }


    if (
        item.url &&
        String(item.url).trim()
    ) {

        return String(
            item.url
        ).trim();

    }


    return "";

}


// ======================================
// CREATE DOWNLOAD URL
// ======================================

function getPastQuestionDownloadUrl(
    item
) {

    const originalUrl =
        getPastQuestionFileUrl(item);


    if (!originalUrl) {
        return "";
    }


    /*
     * Cloudinary URLs normally contain:
     *
     * /upload/
     *
     * We insert:
     *
     * /upload/fl_attachment/
     *
     * This tells Cloudinary to send
     * the file as a download.
     */


    if (
        originalUrl.includes(
            "/upload/"
        )
    ) {

        return originalUrl.replace(
            "/upload/",
            "/upload/fl_attachment/"
        );

    }


    return originalUrl;

}


// ======================================
// DETERMINE FILE TYPE
// ======================================

function getFileCategory(item) {

    const fileName =
        String(
            item.fileName || ""
        ).toLowerCase();


    const fileType =
        String(
            item.fileType || ""
        ).toLowerCase();


    if (
        fileType.includes("pdf") ||
        fileName.endsWith(".pdf")
    ) {

        return "pdf";

    }


    if (
        fileName.endsWith(".doc") ||
        fileType.includes("msword")
    ) {

        return "doc";

    }


    if (
        fileName.endsWith(".docx") ||
        fileType.includes(
            "wordprocessingml"
        )
    ) {

        return "docx";

    }


    if (
        fileType.startsWith("image/") ||

        fileName.endsWith(".jpg") ||
        fileName.endsWith(".jpeg") ||
        fileName.endsWith(".png") ||
        fileName.endsWith(".gif") ||
        fileName.endsWith(".webp") ||
        fileName.endsWith(".bmp") ||
        fileName.endsWith(".svg")
    ) {

        return "image";

    }


    return "file";

}


// ======================================
// FILE ICON
// ======================================

function getFileIcon(item) {

    const category =
        getFileCategory(item);


    if (category === "pdf") {

        return "fa-file-pdf";

    }


    if (
        category === "doc" ||
        category === "docx"
    ) {

        return "fa-file-word";

    }


    if (category === "image") {

        return "fa-file-image";

    }


    return "fa-file-lines";

}


// ======================================
// DISPLAY
// ======================================

function displayPastQuestions(list) {

    const container =
        document.getElementById(
            "pastQuestionsContainer"
        );


    if (!container) return;


    if (
        !list ||
        list.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-books">

                <div class="empty-icon">

                    <i class="
                        fa-solid
                        fa-folder-open
                    "></i>

                </div>

                <h3>
                    No Past Questions Yet
                </h3>

                <p>
                    Past questions uploaded by
                    the department will appear here.
                </p>

            </div>

        `;

        return;

    }


    let html = "";


    list.forEach(function (item, index) {

        const course =
            item.courseCode ||
            item.course ||
            "Unknown Course";


        const fileName =
            item.fileName ||
            "Past Question";


        const year =
            item.year ||
            "Year not specified";


        const semester =
            item.semester ||
            "Semester not specified";


        const description =
            item.description ||
            `${course} past question`;


        const fileUrl =
            getPastQuestionFileUrl(
                item
            );


        const downloadUrl =
            getPastQuestionDownloadUrl(
                item
            );


        const icon =
            getFileIcon(item);


        const category =
            getFileCategory(item);


        html += `

            <article
                class="book-card"
                style="
                    animation-delay:
                    ${index * 0.08}s;
                "
            >

                <div class="book-icon">

                    <i class="
                        fa-solid
                        ${icon}
                    "></i>

                </div>


                <h3 class="book-title">

                    ${escapePastText(
                        course
                    )}

                </h3>


                <p class="book-author">

                    ${escapePastText(
                        fileName
                    )}

                </p>


                <p class="book-description">

                    ${escapePastText(
                        description
                    )}

                </p>


                <div class="book-meta">

                    <span class="book-year">

                        ${escapePastText(
                            year
                        )}

                    </span>


                    <span class="book-semester">

                        ${escapePastText(
                            semester
                        )}

                    </span>

                </div>


                <div class="book-buttons">

                    ${
                        fileUrl

                        ?

                        `

                        <a
                            href="${escapePastAttribute(
                                fileUrl
                            )}"
                            target="_blank"
                            rel="
                                noopener
                                noreferrer
                            "
                            class="view-btn"
                        >

                            <i class="
                                fa-solid
                                fa-eye
                            "></i>

                            View

                        </a>


                        <a
                            href="${escapePastAttribute(
                                downloadUrl
                            )}"
                            class="download-btn"
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
                            class="file-unavailable"
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

            </article>

        `;

    });


    container.innerHTML = html;

}


// ======================================
// SEARCH
// ======================================

function searchPastQuestions() {

    const input =
        document.getElementById(
            "searchPast"
        );


    if (!input) return;


    const keyword =
        input.value
            .trim()
            .toLowerCase();


    const filtered =
        allPastQuestions.filter(
            function (item) {

                return (

                    String(
                        item.courseCode ||
                        item.course ||
                        ""
                    )
                    .toLowerCase()
                    .includes(keyword)

                    ||

                    String(
                        item.fileName ||
                        ""
                    )
                    .toLowerCase()
                    .includes(keyword)

                    ||

                    String(
                        item.year ||
                        ""
                    )
                    .toLowerCase()
                    .includes(keyword)

                    ||

                    String(
                        item.semester ||
                        ""
                    )
                    .toLowerCase()
                    .includes(keyword)

                    ||

                    String(
                        item.description ||
                        ""
                    )
                    .toLowerCase()
                    .includes(keyword)

                );

            }
        );


    displayPastQuestions(
        filtered
    );

}


// ======================================
// ESCAPE TEXT
// ======================================

function escapePastText(value) {

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
// ESCAPE ATTRIBUTE
// ======================================

function escapePastAttribute(value) {

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