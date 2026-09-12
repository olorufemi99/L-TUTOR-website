// ==========================================
// L-TUTOR
// STUDENT VIDEO TUTORIALS
// PUBLIC CONTENT VERSION
// ==========================================

let allVideos = [];

// ==========================================
// PAGE READY
// ==========================================

document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("videosContainer");

    if (!container) {
        console.error("videosContainer not found.");
        return;
    }

    // Videos are public content. Do NOT wait for a student
    // authentication state before loading them.
    loadStudentVideos();
});

// ==========================================
// LOAD VIDEOS
// ==========================================

async function loadStudentVideos() {
    const container = document.getElementById("videosContainer");

    if (!container) return;

    container.innerHTML = `
        <div class="video-loading">
            <i class="fa-solid fa-spinner fa-spin"></i>
            <p>Loading video tutorials...</p>
        </div>
    `;

    try {
        if (!window.db || typeof window.db.collection !== "function") {
            throw new Error("Firestore is not initialized. Please refresh the page and try again.");
        }

        // No orderBy() is used here because older documents may not
        // contain createdAt. We sort safely in JavaScript instead.
        const snapshot = await window.db.collection("videos").get();

        allVideos = [];

        snapshot.forEach(function (doc) {
            allVideos.push({
                id: doc.id,
                ...doc.data()
            });
        });

        allVideos.sort(function (a, b) {
            return getTimestamp(b.createdAt) - getTimestamp(a.createdAt);
        });

        displayVideos(allVideos);

    } catch (error) {
        console.error("Video loading error:", error);

        container.innerHTML = `
            <div class="video-error">
                <i class="fa-solid fa-circle-exclamation"></i>
                <h3>Unable to load videos</h3>
                <p>${escapeVideoText(error.message || "Please try again later.")}</p>
                <button type="button" class="retry-video-btn"
                        onclick="loadStudentVideos()">
                    <i class="fa-solid fa-rotate-right"></i>
                    Try Again
                </button>
            </div>
        `;
    }
}

// ==========================================
// TIMESTAMP
// ==========================================

function getTimestamp(value) {
    if (!value) return 0;

    try {
        if (typeof value.toDate === "function") {
            return value.toDate().getTime();
        }

        if (typeof value.toMillis === "function") {
            return value.toMillis();
        }

        if (typeof value.seconds === "number") {
            return value.seconds * 1000;
        }

        const date = new Date(value);
        return isNaN(date.getTime()) ? 0 : date.getTime();

    } catch (error) {
        return 0;
    }
}

// ==========================================
// DISPLAY
// ==========================================

function displayVideos(list) {
    const container = document.getElementById("videosContainer");

    if (!container) return;

    if (!list || list.length === 0) {
        container.innerHTML = `
            <div class="video-empty">
                <i class="fa-solid fa-video-slash"></i>
                <h3>No Video Tutorials Yet</h3>
                <p>Video tutorials uploaded by the department will appear here.</p>
            </div>
        `;
        return;
    }

    let html = "";
    let validCount = 0;

    list.forEach(function (video) {
        const course = video.courseCode || "Unknown Course";
        const title = video.title || "Untitled Video";
        const lecturer = video.lecturer || "Department";
        const description = video.description || "";

        const youtubeLink = normalizeYouTubeUrl(
            video.youtubeLink ||
            video.youtubeURL ||
            video.youtubeUrl ||
            video.videoLink ||
            video.videoURL ||
            video.videoUrl ||
            video.url ||
            video.link ||
            ""
        );

        const videoId = getYouTubeVideoId(youtubeLink);

        if (!youtubeLink) {
            console.warn("Skipping video with no URL:", video);
            return;
        }

        validCount++;

        const playerHtml = videoId
            ? `<iframe
                    src="${escapeVideoAttribute("https://www.youtube-nocookie.com/embed/" + encodeURIComponent(videoId) + "?rel=0&modestbranding=1")}"
                    title="${escapeVideoAttribute(title)}"
                    loading="lazy"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowfullscreen>
               </iframe>`
            : `<video controls playsinline preload="metadata"
                    src="${escapeVideoAttribute(youtubeLink)}"
                    title="${escapeVideoAttribute(title)}">
               </video>`;

        html += `
            <article class="video-card fade-up"
                     style="animation-delay:${(validCount - 1) * 0.08}s">

                <div class="video-player">
                    ${playerHtml}
                </div>

                <div class="video-content">

                    <span class="video-course">
                        ${escapeVideoText(course)}
                    </span>

                    <h3 class="video-title">
                        ${escapeVideoText(title)}
                    </h3>

                    <p class="video-lecturer">
                        <i class="fa-solid fa-user"></i>
                        ${escapeVideoText(lecturer)}
                    </p>

                    ${description ? `
                        <p class="video-description">
                            ${escapeVideoText(description)}
                        </p>
                    ` : ""}

                    <div class="video-actions">
                        <a
                            href="${escapeVideoAttribute(youtubeLink)}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="watch-youtube">
                            <i class="fa-brands fa-youtube"></i>
                            Watch on YouTube
                        </a>
                    </div>
                </div>
            </article>
        `;
    });

    if (!html) {
        container.innerHTML = `
            <div class="video-empty">
                <i class="fa-solid fa-video-slash"></i>
                <h3>No Valid Videos Found</h3>
                <p>The uploaded video links could not be converted into playable videos.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = html;

    if (typeof window.refreshAnimations === "function") {
        window.refreshAnimations(container);
    }
}

// ==========================================
// YOUTUBE URL NORMALIZATION
// ==========================================

function normalizeYouTubeUrl(value) {
    const v = String(value || "").trim();

    if (!v) return "";

    if (/^https?:\/\//i.test(v)) return v;
    if (/^youtu\.be\//i.test(v)) return "https://" + v;
    if (/^www\.youtube\.com\//i.test(v)) return "https://" + v;
    if (/^youtube\.com\//i.test(v)) return "https://" + v;

    return v;
}

// ==========================================
// GET YOUTUBE VIDEO ID
// ==========================================

function getYouTubeVideoId(url) {
    if (!url) return null;

    const value = String(url).trim();

    try {
        const parsed = new URL(/^https?:\/\//i.test(value) ? value : "https://" + value);
        const host = parsed.hostname.toLowerCase();

        if (host === "youtu.be" || host === "www.youtu.be") {
            return parsed.pathname
                .replace(/^\/+/, "")
                .split("/")[0]
                .split("?")[0];
        }

        if (host.includes("youtube.com")) {
            const watchId = parsed.searchParams.get("v");
            if (watchId) return watchId;

            const patterns = [
                /\/embed\/([^/?]+)/,
                /\/shorts\/([^/?]+)/,
                /\/live\/([^/?]+)/
            ];

            for (const pattern of patterns) {
                const match = parsed.pathname.match(pattern);
                if (match) return match[1];
            }
        }

    } catch (error) {
        console.warn("Could not parse YouTube URL:", value);
    }

    return null;
}

// ==========================================
// SEARCH
// ==========================================

function searchStudentVideos() {
    const input = document.getElementById("videoSearch");

    if (!input) return;

    const keyword = input.value.trim().toLowerCase();

    const filtered = allVideos.filter(function (video) {
        return (
            String(video.courseCode || "").toLowerCase().includes(keyword) ||
            String(video.title || "").toLowerCase().includes(keyword) ||
            String(video.lecturer || "").toLowerCase().includes(keyword) ||
            String(video.description || "").toLowerCase().includes(keyword)
        );
    });

    displayVideos(filtered);
}

// ==========================================
// ESCAPE HELPERS
// ==========================================

function escapeVideoText(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeVideoAttribute(value) {
    return escapeVideoText(value);
}
