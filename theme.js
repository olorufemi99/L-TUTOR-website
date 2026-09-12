// ==========================================
// L-TUTOR GLOBAL THEME ENGINE
// Student pages only
// ==========================================

(function () {
    const savedTheme = localStorage.getItem("theme") || "light";

    function updateBrowserThemeColor(isDark) {
        let meta = document.getElementById("ltThemeColor");
        if (!meta) {
            meta = document.createElement("meta");
            meta.id = "ltThemeColor";
            meta.name = "theme-color";
            document.head.appendChild(meta);
        }
        meta.setAttribute("content", isDark ? "#11131a" : "#ffffff");
        document.documentElement.style.colorScheme = isDark ? "dark" : "light";
    }

    function applyInitialTheme() {
        const root = document.documentElement;
        const body = document.body;

        if (savedTheme === "dark") {
            root.classList.add("dark-mode");
            if (body) body.classList.add("dark-mode");
            updateBrowserThemeColor(true);
        } else {
            root.classList.remove("dark-mode");
            if (body) body.classList.remove("dark-mode");
            updateBrowserThemeColor(false);
        }
    }

    applyInitialTheme();

    window.applyTheme = function (themeOverride) {
        const theme = themeOverride === true
            ? "dark"
            : themeOverride === false
                ? "light"
                : (localStorage.getItem("theme") || "light");

        localStorage.setItem("theme", theme);
        const root = document.documentElement;
        const body = document.body;

        if (theme === "dark") {
            root.classList.add("dark-mode");
            if (body) body.classList.add("dark-mode");
            updateBrowserThemeColor(true);
        } else {
            root.classList.remove("dark-mode");
            if (body) body.classList.remove("dark-mode");
            updateBrowserThemeColor(false);
        }

        updateThemeButton();
    };

    window.toggleTheme = function () {
        const isDark =
            document.documentElement.classList.contains("dark-mode") ||
            document.body.classList.contains("dark-mode");

        localStorage.setItem("theme", isDark ? "light" : "dark");
        window.applyTheme();
    };

    function createThemeButton() {
        if (document.getElementById("ltThemeToggle")) return;

        const button = document.createElement("button");

        button.id = "ltThemeToggle";
        button.type = "button";
        button.className = "lt-theme-toggle";
        button.setAttribute("aria-label", "Toggle dark mode");
        button.title = "Toggle dark mode";
        button.addEventListener("click", window.toggleTheme);

        document.body.appendChild(button);
        updateThemeButton();
    }

    function updateThemeButton() {
        const button = document.getElementById("ltThemeToggle");
        if (!button) return;

        const isDark =
            document.documentElement.classList.contains("dark-mode") ||
            document.body.classList.contains("dark-mode");

        button.innerHTML = isDark
            ? '<i class="fa-solid fa-sun"></i>'
            : '<i class="fa-solid fa-moon"></i>';

        button.title = isDark
            ? "Switch to light mode"
            : "Switch to dark mode";
    }

    document.addEventListener("DOMContentLoaded", function () {
        window.applyTheme();
        createThemeButton();
    });
})();
