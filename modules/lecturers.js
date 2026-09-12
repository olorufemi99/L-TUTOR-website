// ======================================
// L-TUTOR ADMIN — LECTURERS MODULE
// Stable version: search + add + edit + delete + photo preview
// ======================================

let editingLecturer = false;
let editingLecturerId = null;

function getLecturersCollection() {
    if (window.lecturersRef) return window.lecturersRef;
    if (window.db && typeof window.db.collection === "function") {
        return window.db.collection("lecturers");
    }
    throw new Error("Firestore is not initialized. Please refresh the page and try again.");
}

function loadLecturersModule() {
    if (typeof pageTitle !== "undefined") pageTitle.innerHTML = "Lecturers";
    if (typeof pageSubtitle !== "undefined") pageSubtitle.innerHTML = "Manage academic staff.";

    contentArea.innerHTML = `
    <div class="panel">
        <h2><i class="fa-solid fa-user-tie"></i> Lecturer Information</h2>

        <div class="form-grid">
            <div class="form-group">
                <label>Lecturer Photo</label>
                <div class="upload-box" onclick="document.getElementById('lecturerPhotoFile').click()">
                    <i class="fa-solid fa-camera"></i>
                    <p>Click to Upload Lecturer Photo</p>
                </div>
                <input type="file" id="lecturerPhotoFile" accept="image/*" hidden>
                <div id="lecturerPhotoPreview" class="upload-preview"></div>
                <div id="lecturerPhotoStatus" class="upload-success"></div>
            </div>

            <div class="form-group">
                <label>Full Name</label>
                <input type="text" id="lecturerName" placeholder="Dr. R. A. Okewale">
            </div>

            <div class="form-group">
                <label>Academic Rank</label>
                <input type="text" id="lecturerRank" placeholder="Senior Lecturer">
            </div>

            <div class="form-group">
                <label>Administrative Position</label>
                <input type="text" id="lecturerPosition" placeholder="Head of Department">
            </div>

            <div class="form-group">
                <label>Department</label>
                <input type="text" id="lecturerDepartment" placeholder="Local Government Administration">
            </div>

            <div class="form-group">
                <label>Faculty</label>
                <input type="text" id="lecturerFaculty" placeholder="Faculty of Management Sciences">
            </div>

            <div class="form-group">
                <label>Email</label>
                <input type="email" id="lecturerEmail" placeholder="example@lasu.edu.ng">
            </div>

            <div class="form-group">
                <label>WhatsApp</label>
                <input type="text" id="lecturerWhatsapp" placeholder="2348012345678">
            </div>

            <div class="form-group">
                <label>Biography</label>
                <textarea id="lecturerBio" placeholder="Write biography..."></textarea>
            </div>

            <div class="form-group">
                <label>Qualifications</label>
                <textarea id="lecturerQualifications" placeholder="Ph.D..."></textarea>
            </div>

            <div class="form-group">
                <label>Courses Taught</label>
                <textarea id="lecturerCourses" placeholder="LGD314&#10;LGD322"></textarea>
            </div>

            <div class="form-group">
                <label>Research Interests</label>
                <textarea id="lecturerResearch" placeholder="Governance..."></textarea>
            </div>
        </div>

        <button class="save-btn" id="saveLecturerBtn" type="button">
            <i class="fa-solid fa-floppy-disk"></i> Save Lecturer
        </button>
    </div>

    <div class="panel">
        <h2>Academic Staff</h2>
        <div class="form-group">
            <input type="text" id="lecturerSearch" placeholder="Search Lecturer..." autocomplete="off">
        </div>

        <table>
            <thead>
                <tr>
                    <th>Photo</th>
                    <th>Name</th>
                    <th>Rank</th>
                    <th>Position</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="lecturerTable">
                <tr><td colspan="5">Loading Lecturers...</td></tr>
            </tbody>
        </table>
    </div>`;

    const saveButton = document.getElementById("saveLecturerBtn");
    const searchInput = document.getElementById("lecturerSearch");
    const photoInput = document.getElementById("lecturerPhotoFile");

    if (saveButton) saveButton.addEventListener("click", saveLecturer);
    if (searchInput) searchInput.addEventListener("input", window.searchLecturers);
    if (photoInput) {
        photoInput.addEventListener("change", function () {
            previewLecturerPhoto(this);
        });
    }

    editingLecturer = false;
    editingLecturerId = null;
    loadLecturers();
}

function previewLecturerPhoto(input) {
    const preview = document.getElementById("lecturerPhotoPreview");
    const status = document.getElementById("lecturerPhotoStatus");
    const file = input && input.files ? input.files[0] : null;

    if (!preview) return;

    preview.innerHTML = "";
    if (status) status.innerHTML = "";

    if (!file) {
        preview.style.display = "none";
        return;
    }

    if (!file.type || !file.type.startsWith("image/")) {
        if (typeof showWarning === "function") showWarning("Please select an image file.");
        input.value = "";
        preview.style.display = "none";
        return;
    }

    const url = URL.createObjectURL(file);
    preview.innerHTML = `<img src="${url}" alt="Selected lecturer photo" style="max-width:100%;height:auto;border-radius:12px;display:block;">`;
    preview.style.display = "block";
    if (status) status.innerHTML = "Photo selected — ready to upload.";
}

async function saveLecturer() {
    try {
        const collection = getLecturersCollection();
        const photoInput = document.getElementById("lecturerPhotoFile");
        const photoFile = photoInput && photoInput.files ? photoInput.files[0] : null;

        const name = document.getElementById("lecturerName").value.trim();
        const rank = document.getElementById("lecturerRank").value.trim();
        const position = document.getElementById("lecturerPosition").value.trim();
        const department = document.getElementById("lecturerDepartment").value.trim();
        const faculty = document.getElementById("lecturerFaculty").value.trim();
        const email = document.getElementById("lecturerEmail").value.trim();
        const whatsapp = document.getElementById("lecturerWhatsapp").value.trim();
        const biography = document.getElementById("lecturerBio").value.trim();
        const qualifications = document.getElementById("lecturerQualifications").value.trim();
        const courses = document.getElementById("lecturerCourses").value.trim();
        const research = document.getElementById("lecturerResearch").value.trim();

        if (!name || !rank || !department) {
            if (typeof showWarning === "function") showWarning("Please complete all required fields.");
            return;
        }

        let existingPhoto = "";
        if (editingLecturer && editingLecturerId) {
            const oldDoc = await collection.doc(editingLecturerId).get();
            if (!oldDoc.exists) throw new Error("The lecturer you are trying to update no longer exists.");
            existingPhoto = oldDoc.data().photo || "";
        }

        let photo = existingPhoto;
        if (photoFile) {
            if (typeof uploadFile !== "function") throw new Error("The upload system is not available. Please refresh the page.");
            const uploaded = await uploadFile(photoFile);
            photo = uploaded && uploaded.url ? uploaded.url : existingPhoto;
            if (!photo) throw new Error("Lecturer photo uploaded but no URL was returned.");
        }

        const lecturer = {
            photo,
            name,
            rank,
            position,
            department,
            faculty,
            email,
            whatsapp,
            biography,
            qualifications,
            courses,
            research
        };

        if (editingLecturer && editingLecturerId) {
            await collection.doc(editingLecturerId).update(lecturer);
            if (typeof showSuccess === "function") showSuccess("Lecturer updated successfully.");
        } else {
            lecturer.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await collection.add(lecturer);
            if (typeof showSuccess === "function") showSuccess("Lecturer added successfully.");
        }

        resetLecturerForm();
        await loadLecturers();
    } catch (error) {
        console.error("Lecturer save/update error:", error);
        if (typeof showError === "function") showError(error.message || "Unable to save lecturer.");
        else alert(error.message || "Unable to save lecturer.");
    }
}

async function loadLecturers() {
    const table = document.getElementById("lecturerTable");
    if (!table) return;

    table.innerHTML = `<tr><td colspan="5">Loading Lecturers...</td></tr>`;

    try {
        const collection = getLecturersCollection();
        const snapshot = await collection.orderBy("name").get();

        if (snapshot.empty) {
            table.innerHTML = `<tr><td colspan="5">No Lecturers Added.</td></tr>`;
            return;
        }

        const rows = [];
        snapshot.forEach(function (doc) {
            const l = doc.data() || {};
            const photo = String(l.photo || "images/default-user.svg");
            const name = escapeLecturerHtml(l.name || "Unnamed Lecturer");
            const rank = escapeLecturerHtml(l.rank || "-");
            const position = escapeLecturerHtml(l.position || "-");
            const safeId = encodeURIComponent(doc.id);

            rows.push(`
                <tr>
                    <td>
                        <img src="${escapeLecturerAttribute(photo)}" alt="${name}" class="table-avatar" style="cursor:pointer"
                             onclick="previewAdminFile(decodeURIComponent('${encodeURIComponent(photo)}'),decodeURIComponent('${encodeURIComponent(l.name || "Lecturer Photo")}'),'image')">
                    </td>
                    <td>${name}</td>
                    <td>${rank}</td>
                    <td>${position}</td>
                    <td>
                        <button class="edit-btn" type="button" onclick="editLecturer(decodeURIComponent('${safeId}'))" title="Edit">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="delete-btn" type="button" onclick="deleteLecturer(decodeURIComponent('${safeId}'))" title="Delete">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>`);
        });

        table.innerHTML = rows.join("");
        window.searchLecturers();
    } catch (error) {
        console.error("Load lecturers error:", error);
        table.innerHTML = `<tr><td colspan="5">Unable to load lecturers.</td></tr>`;
        if (typeof showError === "function") showError(error.message || "Unable to load lecturers.");
    }
}

function searchLecturers() {
    const input = document.getElementById("lecturerSearch");
    const keyword = input ? input.value.trim().toUpperCase() : "";
    const rows = document.querySelectorAll("#lecturerTable tr");

    rows.forEach(function (row) {
        const text = (row.innerText || "").toUpperCase();
        row.style.display = text.includes(keyword) ? "" : "none";
    });
}
window.searchLecturers = searchLecturers;

async function editLecturer(id) {
    try {
        const collection = getLecturersCollection();
        const doc = await collection.doc(id).get();
        if (!doc.exists) throw new Error("Lecturer not found.");

        const l = doc.data() || {};
        editingLecturer = true;
        editingLecturerId = id;

        document.getElementById("lecturerName").value = l.name || "";
        document.getElementById("lecturerRank").value = l.rank || "";
        document.getElementById("lecturerPosition").value = l.position || "";
        document.getElementById("lecturerDepartment").value = l.department || "";
        document.getElementById("lecturerFaculty").value = l.faculty || "";
        document.getElementById("lecturerEmail").value = l.email || "";
        document.getElementById("lecturerWhatsapp").value = l.whatsapp || "";
        document.getElementById("lecturerBio").value = l.biography || "";
        document.getElementById("lecturerQualifications").value = l.qualifications || "";
        document.getElementById("lecturerCourses").value = l.courses || "";
        document.getElementById("lecturerResearch").value = l.research || "";

        const preview = document.getElementById("lecturerPhotoPreview");
        if (preview) {
            if (l.photo) {
                preview.style.display = "block";
                preview.innerHTML = `<img src="${escapeLecturerAttribute(l.photo)}" alt="Current lecturer photo" style="max-width:100%;height:auto;border-radius:12px;display:block;">`;
            } else {
                preview.style.display = "none";
                preview.innerHTML = "";
            }
        }

        const button = document.getElementById("saveLecturerBtn");
        if (button) button.innerHTML = '<i class="fa-solid fa-pen"></i> Update Lecturer';

        document.querySelectorAll(".form-grid input, .form-grid textarea").forEach(function (field) {
            field.scrollIntoView({ behavior: "smooth", block: "center" });
        });
    } catch (error) {
        console.error("Edit lecturer error:", error);
        if (typeof showError === "function") showError(error.message || "Unable to edit lecturer.");
    }
}
window.editLecturer = editLecturer;

async function deleteLecturer(id) {
    try {
        let confirmed = true;
        if (typeof showConfirm === "function") {
            const result = await showConfirm("Delete Lecturer", "Are you sure you want to delete this lecturer?");
            confirmed = !!(result && result.isConfirmed);
        } else {
            confirmed = window.confirm("Are you sure you want to delete this lecturer?");
        }

        if (!confirmed) return;

        await getLecturersCollection().doc(id).delete();
        if (typeof showSuccess === "function") showSuccess("Lecturer deleted successfully.");
        await loadLecturers();
        if (typeof updateDashboardCounts === "function") updateDashboardCounts();
    } catch (error) {
        console.error("Delete lecturer error:", error);
        if (typeof showError === "function") showError(error.message || "Unable to delete lecturer.");
    }
}
window.deleteLecturer = deleteLecturer;

function resetLecturerForm() {
    editingLecturer = false;
    editingLecturerId = null;

    document.querySelectorAll(".form-grid input, .form-grid textarea").forEach(function (field) {
        field.value = "";
    });

    const preview = document.getElementById("lecturerPhotoPreview");
    if (preview) {
        preview.innerHTML = "";
        preview.style.display = "none";
    }

    const status = document.getElementById("lecturerPhotoStatus");
    if (status) status.innerHTML = "";

    const button = document.getElementById("saveLecturerBtn");
    if (button) button.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Lecturer';
}

function escapeLecturerHtml(value) {
    return String(value).replace(/[&<>'"]/g, function (char) {
        return {"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char];
    });
}

function escapeLecturerAttribute(value) {
    return escapeLecturerHtml(value);
}
