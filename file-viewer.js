// ==========================================
// L-TUTOR UNIVERSAL FILE VIEWER
// ==========================================

document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const url = params.get("url") || "";
    const title = params.get("title") || "File Viewer";
    const type = (params.get("type") || "").toLowerCase();

    const content = document.getElementById("viewerContent");
    const titleEl = document.getElementById("viewerTitle");
    const back = document.getElementById("backBtn");

    if (titleEl) titleEl.textContent = title;
    if (back) back.href = document.referrer || "dashboard.html";

    if (!content || !url) {
        if (content) content.innerHTML =
            '<div class="viewer-empty"><i class="fa-solid fa-file-circle-exclamation"></i><p>File not available.</p></div>';
        return;
    }

    const decoded = url; // URLSearchParams has already decoded it safely.
    const isImage =
        type.includes("image") ||
        /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i.test(decoded);

    const isPdf =
        type.includes("pdf") ||
        /\.pdf(\?|$)/i.test(decoded);

    if (isImage) {
        content.innerHTML = `
            <div class="viewer-frame-wrap">
                <img class="viewer-image" src="${safe(decoded)}" alt="${safe(title)}">
            </div>`;
        return;
    }

    if (isPdf) {
        // Mobile browsers/WebViews often cannot render a PDF directly.
        // Google Viewer provides a browser-friendly PDF preview.
        const googleViewer =
            "https://docs.google.com/gview?embedded=1&url=" +
            encodeURIComponent(decoded);

        content.innerHTML = `
            <iframe
                class="viewer-frame viewer-pdf"
                src="${safe(googleViewer)}"
                title="${safe(title)}"
                loading="lazy"
                referrerpolicy="no-referrer">
            </iframe>

            <div class="viewer-actions">
                <a href="${safe(decoded)}" target="_blank" rel="noopener noreferrer">
                    <i class="fa-solid fa-up-right-from-square"></i> Open PDF
                </a>
                <a href="${safe(forceDownload(decoded))}" target="_blank" rel="noopener noreferrer">
                    <i class="fa-solid fa-download"></i> Download
                </a>
            </div>`;
        return;
    }

    content.innerHTML = `
        <div class="viewer-empty">
            <i class="fa-solid fa-file-lines"></i>
            <h3>${safe(title)}</h3>
            <p>This document type may not preview inside every mobile browser.</p>
            <div class="viewer-actions">
                <a href="${safe(decoded)}" target="_blank" rel="noopener noreferrer">Open</a>
                <a href="${safe(forceDownload(decoded))}" target="_blank" rel="noopener noreferrer">Download</a>
            </div>
        </div>`;
});

function forceDownload(url) {
    if (!url) return "";
    if (
        url.includes("res.cloudinary.com") &&
        url.includes("/upload/") &&
        !url.includes("/fl_attachment/")
    ) {
        return url.replace("/upload/", "/upload/fl_attachment/");
    }
    return url;
}

function safe(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
