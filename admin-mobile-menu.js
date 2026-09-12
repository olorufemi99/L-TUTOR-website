// L-TUTOR ADMIN - MOBILE MENU
// Mobile only: the existing sidebar becomes a left-side drawer.
(function () {
    function init() {
        const button = document.getElementById("adminMobileMenuBtn");
        const sidebar = document.getElementById("adminSidebar");
        const overlay = document.getElementById("adminMobileOverlay");
        if (!button || !sidebar || !overlay) return;

        function setOpen(open) {
            sidebar.classList.toggle("admin-mobile-open", open);
            overlay.classList.toggle("admin-mobile-visible", open);
            button.setAttribute("aria-expanded", String(open));
            button.innerHTML = open
                ? '<i class="fa-solid fa-xmark"></i>'
                : '<i class="fa-solid fa-bars"></i>';
        }

        button.addEventListener("click", function () {
            setOpen(!sidebar.classList.contains("admin-mobile-open"));
        });

        overlay.addEventListener("click", function () { setOpen(false); });

        sidebar.addEventListener("click", function (event) {
            if (event.target.closest(".menu-item") || event.target.closest("#logoutBtn")) {
                setOpen(false);
            }
        });

        window.addEventListener("resize", function () {
            if (window.innerWidth > 900) setOpen(false);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
