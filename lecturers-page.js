// ======================================
// L-TUTOR STUDENT ACADEMIC STAFF PAGE
// ======================================
(function () {
  "use strict";

  const lecturerContainer = document.getElementById("lecturerContainer");
  let lecturers = [];

  function getDB() {
    if (window.db && typeof window.db.collection === "function") return window.db;
    if (window.firebase && firebase.apps && firebase.apps.length) {
      try { window.db = firebase.firestore(); return window.db; } catch (e) {}
    }
    return null;
  }

  function waitForDB(attempt) {
    const db = getDB();
    if (db) return Promise.resolve(db);
    if (attempt >= 30) return Promise.reject(new Error("Firestore is not initialized."));
    return new Promise(r => setTimeout(r, 150)).then(() => waitForDB(attempt + 1));
  }

  function safe(value) {
    return String(value || "").replace(/&/g,"&amp;").replace(/</g,"&lt;")
      .replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
  }

  async function loadLecturers() {
    if (!lecturerContainer) return;
    lecturerContainer.innerHTML = '<div class="loading"><i class="fa-solid fa-spinner fa-spin"></i><h2>Loading Academic Staff...</h2></div>';
    try {
      const db = await waitForDB(0);
      const snapshot = await db.collection("lecturers").get();
      lecturers = [];
      snapshot.forEach(doc => lecturers.push({ id: doc.id, ...doc.data() }));
      lecturers.sort((a,b) => String(a.name || "").localeCompare(String(b.name || "")));
      displayLecturers(lecturers);
    } catch (error) {
      console.error(error);
      lecturerContainer.innerHTML = `<div class="loading"><i class="fa-solid fa-circle-exclamation"></i><h2>Unable to load lecturers</h2><p>Please refresh the page and try again.</p></div>`;
    }
  }

  function displayLecturers(list) {
    if (!list.length) {
      lecturerContainer.innerHTML = '<div class="loading"><i class="fa-solid fa-user-slash"></i><h2>No lecturers available.</h2></div>';
      return;
    }
    lecturerContainer.innerHTML = list.map(lecturer => {
      const photo = lecturer.photo || lecturer.photoUrl || "images/default-user.svg";
      return `<article class="lecturer-card">
        <div class="lecturer-photo-wrap">
          <div class="lecturer-photo-backdrop" style="background-image:url('${safe(photo)}')"></div>
          <img src="${safe(photo)}" alt="${safe(lecturer.name || "Lecturer")}" onerror="this.src='images/default-user.svg'">
        </div>
        <div class="lecturer-content">
          <h2>${safe(lecturer.name || "Unnamed Lecturer")}</h2>
          <p class="rank">${safe(lecturer.position || lecturer.rank || "")}</p>
          <a href="lecturer-profile.html?id=${encodeURIComponent(lecturer.id)}" class="profile-btn">View Profile</a>
        </div>
      </article>`;
    }).join("");
  }

  window.searchLecturers = function () {
    const input = document.getElementById("searchLecturer");
    const keyword = input ? input.value.toLowerCase().trim() : "";
    displayLecturers(lecturers.filter(l =>
      String(l.name || "").toLowerCase().includes(keyword) ||
      String(l.position || "").toLowerCase().includes(keyword) ||
      String(l.rank || "").toLowerCase().includes(keyword)
    ));
  };

  document.addEventListener("DOMContentLoaded", loadLecturers);
})();
