// ==========================================
// L-TUTOR STUDENT ROUTE GUARD
// Prevent direct access to protected pages
// ==========================================

(function () {
    // Prevent protected content from flashing before Firebase verifies the user.
    document.documentElement.classList.add("lt-guard-pending");

    const PUBLIC_PAGES = [
        "index.html",
        "login.html",
        "register.html",
        "about.html",
        "contact.html",
        "public-courses.html",
        "news.html"
    ];

    const currentPage =
        (window.location.pathname.split("/").pop() || "index.html")
        .toLowerCase();

    if (PUBLIC_PAGES.includes(currentPage)) {
        document.documentElement.classList.remove("lt-guard-pending");
        return;
    }

    function redirectToLogin() {
        const target = encodeURIComponent(
            window.location.pathname + window.location.search
        );
        window.location.replace("login.html?returnTo=" + target);
    }

    function checkStudent() {
        if (!window.auth || !window.db) {
            document.documentElement.classList.remove("lt-guard-pending");
            redirectToLogin();
            return;
        }

        window.auth.onAuthStateChanged(function (user) {
            if (!user) {
                redirectToLogin();
                return;
            }

            // Student pages should have a matching active student record.
            // Admin pages use admin-guard below instead.
            if (currentPage === "admin.html" || currentPage === "admin-login.html") {
                return;
            }

            window.db.collection("students")
                .doc(user.uid)
                .get()
                .then(function (snap) {
                    if (!snap.exists) {
                        return window.auth.signOut().then(redirectToLogin);
                    }

                    const student = snap.data() || {};
                    const status = String(student.status || "Active").toLowerCase();

                    if (status === "suspended") {
                        window.auth.signOut();
                        window.location.replace("login.html?reason=suspended");
                        return;
                    }

                    document.documentElement.classList.remove("lt-guard-pending");
                })
                .catch(function () {
                    // Do not expose protected page data when the identity record cannot be verified.
                    window.auth.signOut().finally(redirectToLogin);
                });
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", checkStudent);
    } else {
        checkStudent();
    }
})();
