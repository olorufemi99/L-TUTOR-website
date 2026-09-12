/* ==========================================
   L-TUTOR COURSE PAGE
   DYNAMIC COURSE LOADER
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {

    const courseContent =
        document.getElementById("courseContent");

    if (!courseContent) {
        console.error("courseContent element not found.");
        return;
    }


    /* ==========================================
       GET COURSE ID
    ========================================== */

    const params =
        new URLSearchParams(
            window.location.search
        );

    const courseId =
        params.get("course") ||
        params.get("id") ||
        params.get("courseId");


    console.log(
        "Course ID:",
        courseId
    );


    if (!courseId) {

        showError(
            "No Course Selected",
            "Please return to the courses page and select a course."
        );

        return;

    }


    /* ==========================================
       FIREBASE CHECK
    ========================================== */

    if (
        typeof firebase === "undefined" ||
        typeof firebase.firestore !== "function"
    ) {

        showError(
            "Connection Error",
            "Firebase could not be loaded."
        );

        return;

    }


    let db;


    try {

        db =
            firebase.firestore();

    }

    catch(error) {

        console.error(
            "Firestore error:",
            error
        );

        showError(
            "Database Error",
            "Unable to connect to the course database."
        );

        return;

    }


    /* ==========================================
       LOAD COURSE
    ========================================== */

    loadCourse(
        db,
        courseId
    );


    /* ==========================================
       COURSE LOADER
    ========================================== */

    async function loadCourse(
        db,
        courseId
    ) {

        try {

            showLoading();


            let course = null;


            /* ==================================
               TRY DOCUMENT ID
            ================================== */

            try {

                const doc =
                    await db
                        .collection("courses")
                        .doc(courseId)
                        .get();


                if(doc.exists) {

                    course = {

                        id:
                            doc.id,

                        ...doc.data()

                    };

                }

            }

            catch(error) {

                console.warn(
                    "Direct course lookup failed:",
                    error
                );

            }


            /* ==================================
               SEARCH COURSE
            ================================== */

            if(!course) {

                const snapshot =
                    await db
                        .collection("courses")
                        .get();


                snapshot.forEach(
                    function(doc) {

                        if(course) {
                            return;
                        }


                        const data =
                            doc.data();


                        const values = [

                            doc.id,

                            data.id,

                            data.courseId,

                            data.code,

                            data.courseCode,

                            data.course_code,

                            data.title,

                            data.name

                        ];


                        const found =
                            values.some(
                                function(value) {

                                    if(
                                        value ===
                                        undefined ||
                                        value === null
                                    ) {

                                        return false;

                                    }


                                    return (
                                        normalize(value) ===
                                        normalize(courseId)
                                    );

                                }
                            );


                        if(found) {

                            course = {

                                id:
                                    doc.id,

                                ...data

                            };

                        }

                    }
                );

            }


            /* ==================================
               COURSE NOT FOUND
            ================================== */

            if(!course) {

                showError(
                    "Course Not Found",
                    `We couldn't find "${courseId}" in the course database.`
                );

                return;

            }


            console.log(
                "Course loaded:",
                course
            );


            /*
             * IMPORTANT:
             *
             * renderCourse is async because
             * lecture notes are loaded from
             * Firestore.
             */

            await renderCourse(
                course
            );

        }

        catch(error) {

            console.error(
                "Unable to load course:",
                error
            );


            showError(
                "Unable to Load Course",
                error.message ||
                "Something went wrong while loading this course."
            );

        }

    }


    /* ==========================================
       RENDER COURSE
    ========================================== */

    async function renderCourse(
        course
    ) {

        const code =
            course.code ||
            course.courseCode ||
            course.course_code ||
            course.id ||
            "COURSE";


        const title =
            course.title ||
            course.name ||
            course.courseTitle ||
            "Untitled Course";


        const level =
            course.level ||
            course.studentLevel ||
            course.classLevel ||
            "Level not specified";


        const semester =
            course.semester ||
            course.term ||
            "Semester not specified";


        const units =
            course.units ||
            course.unit ||
            "—";


        const lecturer =
            course.lecturer ||
            course.lecturerName ||
            course.instructor ||
            course.teacher ||
            "Not assigned";


        /*
         * IMPORTANT:
         *
         * Wait for resources before
         * replacing Loading course...
         */

        const resources =
            await getResources(
                course
            );


        courseContent.innerHTML = `

            <section class="course-header">

                <div class="course-icon">

                    <i class="
                        fa-solid
                        fa-book-open
                    "></i>

                </div>


                <div class="course-code">

                    ${escapeHTML(code)}

                </div>


                <h1>

                    ${escapeHTML(title)}

                </h1>


                <div class="course-meta">

                    <span>

                        <i class="
                            fa-solid
                            fa-layer-group
                        "></i>

                        ${escapeHTML(level)}

                    </span>


                    <span>

                        <i class="
                            fa-solid
                            fa-calendar
                        "></i>

                        ${escapeHTML(semester)}

                    </span>


                    <span>

                        <i class="
                            fa-solid
                            fa-book
                        "></i>

                        ${escapeHTML(units)}

                        ${
                            units === "—"
                            ? ""
                            : " Units"
                        }

                    </span>

                </div>


                <div class="course-lecturer">

                    <i class="
                        fa-solid
                        fa-user-tie
                    "></i>

                    Lecturer:

                    <strong>

                        ${escapeHTML(
                            lecturer
                        )}

                    </strong>

                </div>

            </section>


            <section class="course-resources">

                ${resources}

            </section>

        `;


        activateAnimations();

    }


    /* ==========================================
       GET ALL COURSE RESOURCES
       Every uploaded item is matched by courseCode.
    ========================================== */

    async function getResources(course) {

        const courseCode = String(
            course.courseCode ||
            course.code ||
            course.course_code ||
            course.id ||
            ""
        ).trim().toUpperCase();

        if (!courseCode) {
            return renderResourceSections({}, course);
        }

        const collections = [
            ["lectureNotes", "uploadedAt"],
            ["pastQuestions", "uploadedAt"],
            ["videos", "createdAt"],
            ["books", "createdAt"]
        ];

        const results = {};

        await Promise.all(collections.map(async function ([collectionName]) {
            try {
                const snapshot = await db.collection(collectionName).get();
                results[collectionName] = [];

                snapshot.forEach(function (doc) {
                    const data = doc.data() || {};
                    const itemCode = String(
                        data.courseCode ||
                        data.course ||
                        data.course_code ||
                        ""
                    ).trim().toUpperCase().replace(/\s+/g, "");

                    const wantedCode = courseCode.replace(/\s+/g, "");

                    if (itemCode === wantedCode) {
                        results[collectionName].push({
                            id: doc.id,
                            ...data
                        });
                    }
                });
            } catch (error) {
                console.error(`${collectionName} course resource error:`, error);
                results[collectionName] = [];
            }
        }));

        Object.keys(results).forEach(function (key) {
            results[key].sort(function (a, b) {
                const aTime = getTimestamp(
                    a.uploadedAt || a.createdAt || a.updatedAt
                );
                const bTime = getTimestamp(
                    b.uploadedAt || b.createdAt || b.updatedAt
                );
                return bTime - aTime;
            });
        });

        return renderResourceSections(results, course);
    }


    /* ==========================================
       RENDER ALL RESOURCE TYPES
    ========================================== */

    function renderResourceSections(resources, course) {

        const notes = resources.lectureNotes || [];
        const pastQuestions = resources.pastQuestions || [];
        const videos = resources.videos || [];
        const books = resources.books || [];

        const sections = [];

        if (notes.length) {
            sections.push(`
                <section class="course-resource-section">
                    <div class="course-resource-heading">
                        <div>
                            <span class="course-resource-kicker">LEARNING MATERIALS</span>
                            <h2><i class="fa-solid fa-file-lines"></i> Lecture Notes</h2>
                        </div>
                        <span class="resource-count">${notes.length}</span>
                    </div>
                    <div class="course-resource-grid">
                        ${notes.map(function (note, index) {
                            const url = getFileUrl(note);
                            return createItemCard(
                                "note",
                                note.topic || note.title || "Lecture Note",
                                note.description || "Lecture material uploaded for this course.",
                                note.lecturer || "Lecturer not specified",
                                note.fileName || "Lecture note",
                                url,
                                "fa-file-lines",
                                index,
                                "View Note"
                            );
                        }).join("")}
                    </div>
                </section>
            `);
        }

        if (pastQuestions.length) {
            sections.push(`
                <section class="course-resource-section">
                    <div class="course-resource-heading">
                        <div>
                            <span class="course-resource-kicker">EXAM PRACTICE</span>
                            <h2><i class="fa-solid fa-file-circle-question"></i> Past Questions</h2>
                        </div>
                        <span class="resource-count">${pastQuestions.length}</span>
                    </div>
                    <div class="course-resource-grid">
                        ${pastQuestions.map(function (item, index) {
                            const url = getPastQuestionUrl(item);
                            const meta = [item.year, item.semester].filter(Boolean).join(" • ");
                            return createItemCard(
                                "past",
                                item.fileName || "Past Question",
                                item.description || "Previous examination question for this course.",
                                meta || "Past Question",
                                item.fileName || "Question paper",
                                url,
                                getFileIcon(item),
                                index,
                                "View Question"
                            );
                        }).join("")}
                    </div>
                </section>
            `);
        }

        if (videos.length) {
            sections.push(`
                <section class="course-resource-section">
                    <div class="course-resource-heading">
                        <div>
                            <span class="course-resource-kicker">VIDEO LESSONS</span>
                            <h2><i class="fa-solid fa-video"></i> Video Tutorials</h2>
                        </div>
                        <span class="resource-count">${videos.length}</span>
                    </div>
                    <div class="course-video-grid">
                        ${videos.map(function (video, index) {
                            return createVideoCard(video, index);
                        }).join("")}
                    </div>
                </section>
            `);
        }

        if (books.length) {
            sections.push(`
                <section class="course-resource-section">
                    <div class="course-resource-heading">
                        <div>
                            <span class="course-resource-kicker">RECOMMENDED READING</span>
                            <h2><i class="fa-solid fa-book-open"></i> Recommended Books</h2>
                        </div>
                        <span class="resource-count">${books.length}</span>
                    </div>
                    <div class="course-resource-grid">
                        ${books.map(function (book, index) {
                            const url = book.pdfURL || book.pdfUrl || book.fileURL || book.fileUrl || book.link || book.url || "";
                            const details = [book.author, book.edition].filter(Boolean).join(" • ");
                            return createItemCard(
                                "book",
                                book.title || "Recommended Book",
                                book.description || "Recommended reading for this course.",
                                details || "Department Library",
                                book.pdfName || "Book file",
                                url,
                                "fa-book-open",
                                index,
                                "View Book"
                            );
                        }).join("")}
                    </div>
                </section>
            `);
        }

        // Keep manually attached course-level resources compatible with older records.
        const courseLinks = [
            ["assignments", "assignmentUrl", "Assignments", "fa-clipboard-list", "View assignments and coursework for this course."],
            ["materials", "materialsUrl", "Course Materials", "fa-folder-open", "Additional materials provided for this course."],
            ["resources", null, "Additional Resources", "fa-layer-group", "Additional resources provided for this course."]
        ];

        courseLinks.forEach(function (entry) {
            const value = course[entry[0]] || (entry[1] ? course[entry[1]] : "");
            if (!value || typeof value !== "string") return;
            sections.push(createResource(
                entry[2],
                entry[4],
                `fa-solid ${entry[3]}`,
                value
            ));
        });

        if (!sections.length) {
            return `
                <div class="course-empty">
                    <div class="empty-icon"><i class="fa-solid fa-folder-open"></i></div>
                    <h3>No Course Resources Yet</h3>
                    <p>Resources uploaded for this course will appear here.</p>
                </div>
            `;
        }

        return sections.join("");
    }


    function getFileUrl(item) {
        return String(
            item.fileUrl ||
            item.fileURL ||
            item.cloudinaryUrl ||
            item.url ||
            ""
        ).trim();
    }


    function getPastQuestionUrl(item) {
        return getFileUrl(item);
    }


    function getFileIcon(item) {
        const name = String(item.fileName || "").toLowerCase();
        const type = String(item.fileType || "").toLowerCase();

        if (type.includes("pdf") || name.endsWith(".pdf")) return "fa-file-pdf";
        if (type.includes("word") || name.endsWith(".doc") || name.endsWith(".docx")) return "fa-file-word";
        if (type.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/.test(name)) return "fa-file-image";
        return "fa-file-lines";
    }


    function createItemCard(type, title, description, meta, fileName, url, icon, index, buttonText) {
        const safeTitle = escapeHTML(title);
        const safeDescription = escapeHTML(description);
        const safeMeta = escapeHTML(meta);
        const safeFileName = escapeHTML(fileName);
        const safeIcon = escapeHTML(icon);
        const href = url ? escapeAttribute(url) : "";

        let action = url
            ? `<a class="course-item-btn" href="${href}" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-eye"></i>${escapeHTML(buttonText)}</a>`
            : `<span class="course-item-unavailable"><i class="fa-solid fa-circle-exclamation"></i> File unavailable</span>`;

        return `
            <article class="course-item-card" style="animation-delay:${index * 0.08}s">
                <div class="course-item-icon"><i class="fa-solid ${safeIcon}"></i></div>
                <div class="course-item-body">
                    <h3>${safeTitle}</h3>
                    <p>${safeDescription}</p>
                    <div class="course-item-meta">
                        <span><i class="fa-solid fa-user"></i>${safeMeta}</span>
                        <span><i class="fa-solid fa-file"></i>${safeFileName}</span>
                    </div>
                    ${action}
                </div>
            </article>
        `;
    }


    function createVideoCard(video, index) {
        const url = normalizeYouTubeUrl(
            video.youtubeLink || video.youtubeURL || video.youtubeUrl || video.link || ""
        );
        const videoId = getYouTubeVideoId(url);
        const title = escapeHTML(video.title || "Untitled Video");
        const lecturer = escapeHTML(video.lecturer || "Department");
        const description = escapeHTML(video.description || "");

        if (!videoId) {
            return `
                <article class="course-item-card course-video-card" style="animation-delay:${index * 0.08}s">
                    <div class="course-item-icon"><i class="fa-solid fa-video-slash"></i></div>
                    <div class="course-item-body">
                        <h3>${title}</h3>
                        <p>Uploaded video link is unavailable or invalid.</p>
                    </div>
                </article>
            `;
        }

        const embedUrl = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?rel=0&modestbranding=1`;

        return `
            <article class="course-video-card" style="animation-delay:${index * 0.08}s">
                <div class="course-video-player">
                    <iframe src="${escapeAttribute(embedUrl)}" title="${title}" loading="lazy" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
                </div>
                <div class="course-video-content">
                    <span class="course-video-badge"><i class="fa-solid fa-video"></i> Video Tutorial</span>
                    <h3>${title}</h3>
                    <p class="course-video-lecturer"><i class="fa-solid fa-user"></i>${lecturer}</p>
                    ${description ? `<p class="course-video-description">${description}</p>` : ""}
                    <a class="course-item-btn" href="${escapeAttribute(url)}" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-youtube"></i>Watch on YouTube</a>
                </div>
            </article>
        `;
    }


    function normalizeYouTubeUrl(value) {
        const v = String(value || "").trim();
        if (!v) return "";
        if (/^https?:\/\//i.test(v)) return v;
        if (/^youtu\.be\//i.test(v)) return "https://" + v;
        if (/^www\.youtube\.com\//i.test(v)) return "https://" + v;
        if (/^youtube\.com\//i.test(v)) return "https://" + v;
        return v;
    }


    function getYouTubeVideoId(url) {
        if (!url) return null;
        try {
            const parsed = new URL(url);
            const host = parsed.hostname.toLowerCase();
            if (host === "youtu.be" || host === "www.youtu.be") {
                return parsed.pathname.replace(/^\/+/, "").split("/")[0].split("?")[0];
            }
            if (host.includes("youtube.com")) {
                const watchId = parsed.searchParams.get("v");
                if (watchId) return watchId;
                for (const pattern of [/\/embed\/([^/?]+)/, /\/shorts\/([^/?]+)/, /\/live\/([^/?]+)/]) {
                    const match = parsed.pathname.match(pattern);
                    if (match) return match[1];
                }
            }
        } catch (error) {
            console.warn("Invalid YouTube URL:", url);
        }
        return null;
    }


    function getTimestamp(value) {
        if (!value) return 0;
        try {
            if (typeof value.toDate === "function") return value.toDate().getTime();
            if (typeof value.toMillis === "function") return value.toMillis();
            if (typeof value.seconds === "number") return value.seconds * 1000;
            const date = new Date(value);
            return isNaN(date.getTime()) ? 0 : date.getTime();
        } catch (error) {
            return 0;
        }
    }


    /* ==========================================
       RESOURCE CARD
    ========================================== */

    function createResource(title, description, icon, url) {
        if(!url) return "";

        return `
            <a href="${escapeAttribute(url)}" class="resource-card">
                <div class="resource-icon"><i class="${icon}"></i></div>
                <div class="resource-text">
                    <h2>${escapeHTML(title)}</h2>
                    <p>${escapeHTML(description)}</p>
                </div>
                <div class="resource-arrow"><i class="fa-solid fa-arrow-right"></i></div>
            </a>
        `;
    }


    /* ==========================================
       LOADING
    ========================================== */

    function showLoading() {

        courseContent.innerHTML = `

            <div class="course-loading">

                <i class="
                    fa-solid
                    fa-spinner
                    fa-spin
                "></i>


                <p>

                    Loading course...

                </p>

            </div>

        `;

    }


    /* ==========================================
       ERROR
    ========================================== */

    function showError(
        title,
        message
    ) {

        courseContent.innerHTML = `

            <div class="course-error">

                <div class="error-icon">

                    <i class="
                        fa-solid
                        fa-circle-exclamation
                    "></i>

                </div>


                <h2>

                    ${escapeHTML(
                        title
                    )}

                </h2>


                <p>

                    ${escapeHTML(
                        message
                    )}

                </p>


                <a
                    href="courses.html"
                    class="back-course-btn"
                >

                    <i class="
                        fa-solid
                        fa-arrow-left
                    "></i>

                    Back to Courses

                </a>

            </div>

        `;

    }


    /* ==========================================
       ANIMATION
    ========================================== */

    function activateAnimations() {

        const cards =
            document.querySelectorAll(
                ".resource-card"
            );


        cards.forEach(
            function(card,index) {

                card.style.animationDelay =
                    `${index * 0.12}s`;

            }
        );

    }


    /* ==========================================
       NORMALIZE
    ========================================== */

    function normalize(value) {

        return String(
            value || ""
        )
        .trim()
        .toLowerCase()
        .replace(
            /\s+/g,
            ""
        );

    }


    /* ==========================================
       ESCAPE HTML
    ========================================== */

    function escapeHTML(value) {

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


    /* ==========================================
       ESCAPE ATTRIBUTE
    ========================================== */

    function escapeAttribute(value) {

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

});