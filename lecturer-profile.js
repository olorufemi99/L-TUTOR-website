// ======================================
// L-TUTOR
// LECTURER PROFILE
// Public academic-staff profile
// ======================================

(function () {
    const profileContent = document.getElementById("profileContent");
    const params = new URLSearchParams(window.location.search);
    const lecturerId = params.get("id");

    function show(message, color) {
        if (!profileContent) return;
        profileContent.innerHTML = `<h2 style="text-align:center;${color ? `color:${color};` : ""}">${message}</h2>`;
    }

    function getDb() {
        if (window.db) return window.db;
        if (typeof window.ensureFirestore === "function") return window.ensureFirestore();
        if (window.firebase && typeof firebase.firestore === "function") {
            if (!firebase.apps || !firebase.apps.length) return null;
            window.db = firebase.firestore();
            return window.db;
        }
        return null;
    }

    if (!lecturerId) {
        show("Lecturer not found.");
        return;
    }

    let db = getDb();
    if (!db) {
        show("Unable to initialize the database. Please refresh the page.", "#c62828");
        return;
    }

    function loadProfile(attempt) {
        db = getDb() || db;

        if (!db) {
            show("Unable to initialize the database. Please refresh the page.", "#c62828");
            return;
        }

        show("Loading lecturer profile...");

        db.collection("lecturers").doc(lecturerId).get()
            .then(function (doc) {
                if (!doc.exists) {
                    show("Lecturer not found.");
                    return;
                }

                const lecturer = doc.data() || {};
                const courses = Array.isArray(lecturer.courses)
                    ? lecturer.courses
                    : String(lecturer.courses || "").split("\n");
                const research = Array.isArray(lecturer.research)
                    ? lecturer.research
                    : String(lecturer.research || "").split(",");

                profileContent.innerHTML = `
                    <div class="profile-card">
                        <div class="profile-image">
                            <img src="${escapeHtml(lecturer.photo || "images/default-user.svg")}" alt="${escapeHtml(lecturer.name || "Lecturer")}" onerror="this.src='images/default-user.svg'">
                        </div>
                        <div class="profile-info">
                            <h1>${escapeHtml(lecturer.name || "Lecturer")}</h1>
                            <p class="rank">${escapeHtml(lecturer.rank || "")}</p>
                            ${lecturer.position ? `<span class="position">${escapeHtml(lecturer.position)}</span>` : ""}

                            <div class="contact-icons">
                                ${lecturer.email ? `<a href="mailto:${escapeAttr(lecturer.email)}" title="Send Email"><i class="fa-solid fa-envelope"></i></a>` : ""}
                                ${lecturer.whatsapp ? `<a href="https://wa.me/${escapeAttr(String(lecturer.whatsapp).replace(/[^0-9]/g, ""))}" target="_blank" rel="noopener" title="Chat on WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>` : ""}
                            </div>

                            <div class="section">
                                <h2>Biography</h2>
                                <p>${escapeHtml(lecturer.biography || "No biography available.")}</p>
                            </div>

                            <div class="section">
                                <h2>Qualifications</h2>
                                <p>${escapeHtml(lecturer.qualifications || "Not Available")}</p>
                            </div>

                            <div class="section">
                                <h2>Courses Taught</h2>
                                <div class="tag-list">
                                    ${courses.filter(item => String(item).trim()).map(course => `<span class="tag">${escapeHtml(String(course).trim())}</span>`).join("")}
                                </div>
                            </div>

                            <div class="section">
                                <h2>Research Interests</h2>
                                <div class="tag-list">
                                    ${research.filter(item => String(item).trim()).map(item => `<span class="tag">${escapeHtml(String(item).trim())}</span>`).join("")}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            })
            .catch(function (error) {
                console.error("Lecturer profile error:", error);

                // A short retry helps when Firebase is still waking up or the
                // browser briefly loses its connection. Do not redirect to login:
                // lecturer profiles are public pages.
                if (attempt < 2) {
                    setTimeout(function () { loadProfile(attempt + 1); }, 700);
                    return;
                }

                show("Unable to load lecturer profile. Please refresh the page and try again.", "#c62828");
            });
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>'"]/g, function (char) {
            return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char];
        });
    }

    function escapeAttr(value) {
        return escapeHtml(value).replace(/`/g, "&#96;");
    }

    loadProfile(0);
})();
