// ======================================
// L-TUTOR HOMEPAGE HERO CAROUSEL
// ======================================

(function () {
    const root = document.getElementById("heroCarousel");
    if (!root) return;

    const track = root.querySelector(".hero-carousel-track");
    const dots = root.querySelector(".hero-carousel-dots");
    const fallback = "images/hero.png";
    let slides = [];
    let index = 0;
    let timer = null;

    function uniqueImages(items) {
        const seen = new Set();
        return items.filter(function (item) {
            const url = typeof item === "string" ? item : item && item.url;
            if (!url || seen.has(url)) return false;
            seen.add(url);
            return true;
        }).map(function (item) {
            return typeof item === "string" ? item : item.url;
        });
    }

    function render() {
        track.innerHTML = slides.map(function (url, i) {
            return `<div class="hero-slide${i === 0 ? " active" : ""}"><img src="${escapeHtml(url)}" alt="L-TUTOR Hero ${i + 1}" onerror="this.closest('.hero-slide').remove()"></div>`;
        }).join("");

        dots.innerHTML = slides.length > 1
            ? slides.map(function (_, i) {
                return `<button type="button" class="hero-dot${i === 0 ? " active" : ""}" data-index="${i}" aria-label="Show hero image ${i + 1}"></button>`;
            }).join("")
            : "";

        dots.querySelectorAll(".hero-dot").forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.dataset.index));
                restart();
            });
        });
    }

    function show(next) {
        if (!slides.length) return;
        index = (next + slides.length) % slides.length;
        track.style.transform = `translateX(-${index * 100}%)`;
        dots.querySelectorAll(".hero-dot").forEach(function (dot, i) {
            dot.classList.toggle("active", i === index);
        });
    }

    function restart() {
        if (timer) clearInterval(timer);
        if (slides.length > 1) {
            timer = setInterval(function () { show(index + 1); }, 5000);
        }
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>'"]/g, function (char) {
            return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char];
        });
    }

    function start(images) {
        slides = uniqueImages(images);
        if (!slides.length) slides = [fallback];
        render();
        restart();
    }

    // The heroSlides collection is public-read and admin-write. This keeps
    // homepage photos separate from private administrator settings.
    if (!window.db) {
        start([fallback]);
        return;
    }

    window.db.collection("heroSlides").orderBy("createdAt", "asc").get()
        .then(function (snapshot) {
            const images = [];
            snapshot.forEach(function (doc) {
                const data = doc.data() || {};
                if (data.url) images.push(data.url);
            });
            start(images.length ? images : [fallback]);
        })
        .catch(function (error) {
            console.warn("Hero carousel could not load uploaded slides:", error);
            start([fallback]);
        });
})();
