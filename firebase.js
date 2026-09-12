// ==========================================
// L-TUTOR FIREBASE INITIALIZATION
// ==========================================
// This file is loaded before every page module that uses Firebase.
// Keep the shared instances on window AND expose them as global vars so
// older L-TUTOR modules using `db` / `auth` continue to work.

const firebaseConfig = {
  apiKey: "AIzaSyDqw1CN1JPh_NQjxOkA7sni4418HdcLN9U",
  authDomain: "l-tutor.firebaseapp.com",
  projectId: "l-tutor",
  storageBucket: "l-tutor.firebasestorage.app",
  messagingSenderId: "1017736311321",
  appId: "1:1017736311321:web:89537e8d50c83bc6357088",
  measurementId: "G-RJWHK17Q2Q"
};

// Avoid a second initialization if a page or browser cache has already
// initialized the default Firebase app.
if (!firebase.apps || !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Firestore is used by both public student pages and the admin portal.
// Some public pages do not load Firebase Authentication, so do not let a
// missing auth SDK prevent Firestore from initializing.
window.auth = (typeof firebase.auth === "function") ? firebase.auth() : null;
window.db = firebase.firestore();

// IMPORTANT: use `var`, not `const`, here. `var` creates a real global
// binding for older scripts that call db.collection(...) directly.
var db = window.db;
var auth = window.auth;

// ==========================================
// FIRESTORE COLLECTION REFERENCES
// ==========================================
window.coursesRef = db.collection("courses");
window.lectureNotesRef = db.collection("lectureNotes");
window.pastQuestionsRef = db.collection("pastQuestions");
window.lecturersRef = db.collection("lecturers");
window.booksRef = db.collection("books");
window.videosRef = db.collection("videos");
window.announcementsRef = db.collection("announcements");
window.studentsRef = db.collection("students");
window.newsRef = db.collection("news");
