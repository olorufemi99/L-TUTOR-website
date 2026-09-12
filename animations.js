// ==========================================
// L-TUTOR GLOBAL SCROLL ANIMATIONS
// Student pages only
// ==========================================

(function () {
    let observer = null;

    const selectors = [
        "section",
        ".hero",
        ".card",
        ".course-card",
        ".course-item",
        ".panel",
        ".profile-card",
        ".settings-card",
        ".resource-card",
        ".announcement-card",
        ".stat-card",
        ".contact-card",
        ".news-card",
        ".book-card",
        ".video-card",
        ".content-card",
        ".library-header",
        ".video-header",
        ".register-box",
        ".login-box"
    ].join(",");

    function prepare(root) {
        const scope = root || document;

        const elements = [];

        if (scope.matches && scope.matches(selectors)) {
            elements.push(scope);
        }

        if (scope.querySelectorAll) {
            scope.querySelectorAll(selectors).forEach(function (element) {
                elements.push(element);
            });
        }

        elements.forEach(function (element) {
            if (element.dataset.ltAnimationReady === "1") return;

            // Don't interfere with explicitly hidden elements.
            if (element.classList.contains("hidden")) {
                element.dataset.ltAnimationReady = "1";
                return;
            }

            element.classList.add("lt-reveal");
            element.dataset.ltAnimationReady = "1";

            if (observer) {
                observer.observe(element);
            }
        });
    }

    function start() {
        if (!("IntersectionObserver" in window)) {
            document.querySelectorAll(selectors).forEach(function (element) {
                element.classList.add("lt-reveal-visible");
            });
            return;
        }

        observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;

                entry.target.classList.add("lt-reveal-visible");
                observer.unobserve(entry.target);
            });
        }, {
            threshold: 0.12,
            rootMargin: "0px 0px -30px 0px"
        });

        prepare(document);

        // Pages such as videos, notes and announcements create cards
        // after Firestore loads. Watch for those new elements too.
        const mutationObserver = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                mutation.addedNodes.forEach(function (node) {
                    if (node.nodeType === 1) {
                        prepare(node);
                    }
                });
            });
        });

        if (document.body) {
            mutationObserver.observe(document.body, {
                childList: true,
                subtree: true
            });
        }

        window.refreshAnimations = function (root) {
            prepare(root || document);
        };
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start);
    } else {
        start();
    }
})();
