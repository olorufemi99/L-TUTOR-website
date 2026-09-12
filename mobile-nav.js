/* ==========================================================
   L-TUTOR STUDENT MOBILE NAVIGATION
   Same visual structure as the landing-page mobile navbar.
   Existing desktop headers/buttons remain untouched on desktop.
========================================================== */
(function () {
    "use strict";

    const pages = [
        ["dashboard.html", "Dashboard"],
        ["courses.html", "Courses"],
        ["lecture-notes.html", "Lecture Notes"],
        ["past-questions.html", "Past Questions"],
        ["video-tutorials.html", "Video Tutorials"],
        ["books.html", "Books"],
        ["announcements.html", "Announcements"],
        ["lecturers.html", "Academic Staff"],
        ["profile.html", "Profile"],
        ["settings.html", "Settings"]
    ];

    function currentPage() {
        return (location.pathname.split("/").pop() || "dashboard.html").toLowerCase();
    }

    function signOut() {
        if (typeof window.logout === "function") {
            window.logout();
            return;
        }

        if (window.auth && typeof window.auth.signOut === "function") {
            window.auth.signOut()
                .finally(function () {
                    window.location.href = "login.html";
                });
            return;
        }

        if (window.firebase && firebase.apps && firebase.apps.length &&
            typeof firebase.auth === "function") {
            firebase.auth().signOut()
                .finally(function () {
                    window.location.href = "login.html";
                });
            return;
        }

        window.location.href = "login.html";
    }

    function init() {
        if (document.querySelector(".lt-mobile-generated")) return;

        const originalHeader = document.querySelector("body > header");
        if (!originalHeader) return;

        originalHeader.classList.add("lt-desktop-header");
        document.body.classList.add("lt-student-nav-ready");

        const header = document.createElement("header");
        header.className = "lt-mobile-generated";
        header.setAttribute("aria-label", "L-TUTOR mobile navigation");

        const brand = document.createElement("a");
        brand.className = "lt-mobile-brand";
        brand.href = "dashboard.html";
        brand.innerHTML = '<img src="images/logo.png" alt="L-TUTOR logo"><span>L-TUTOR</span>';

        const button = document.createElement("button");
        button.type = "button";
        button.className = "lt-mobile-menu-button";
        button.setAttribute("aria-label", "Open menu");
        button.setAttribute("aria-expanded", "false");
        button.innerHTML = "<span></span><span></span><span></span>";

        header.appendChild(brand);
        header.appendChild(button);
        originalHeader.parentNode.insertBefore(header, originalHeader);

        const menu = document.createElement("nav");
        menu.className = "lt-mobile-menu";
        menu.setAttribute("aria-label", "Student navigation menu");

        const list = document.createElement("ul");

        const backItem = document.createElement("li");
        const backButton = document.createElement("button");
        backButton.type = "button";
        backButton.className = "lt-menu-back";
        backButton.textContent = "Back";
        backButton.addEventListener("click", function () {
            if (history.length > 1) {
                history.back();
            } else {
                window.location.href = "dashboard.html";
            }
        });
        backItem.appendChild(backButton);
        list.appendChild(backItem);

        const page = currentPage();

        pages.forEach(function (item) {
            const li = document.createElement("li");
            const a = document.createElement("a");
            a.href = item[0];
            a.textContent = item[1];
            if (page === item[0]) a.classList.add("active");
            li.appendChild(a);
            list.appendChild(li);
        });

        const logoutItem = document.createElement("li");
        const logout = document.createElement("button");
        logout.type = "button";
        logout.className = "lt-menu-logout";
        logout.textContent = "Logout";
        logout.addEventListener("click", signOut);
        logoutItem.appendChild(logout);
        list.appendChild(logoutItem);

        menu.appendChild(list);
        document.body.appendChild(menu);

        function closeMenu() {
            menu.classList.remove("active");
            button.classList.remove("active");
            button.setAttribute("aria-expanded", "false");
            button.setAttribute("aria-label", "Open menu");
        }

        function toggleMenu(event) {
            if (event) event.stopPropagation();
            const open = !menu.classList.contains("active");
            menu.classList.toggle("active", open);
            button.classList.toggle("active", open);
            button.setAttribute("aria-expanded", String(open));
            button.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        }

        button.addEventListener("click", toggleMenu);
        brand.addEventListener("click", closeMenu);
        menu.querySelectorAll("a").forEach(function (a) {
            a.addEventListener("click", closeMenu);
        });
        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") closeMenu();
        });
        window.addEventListener("resize", function () {
            if (window.innerWidth > 768) closeMenu();
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
