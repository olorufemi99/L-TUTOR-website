// ==========================================
// L-TUTOR ADMIN PREVIEW HELPER
// Images + PDF + Video + Generic files
// ==========================================
function escapeAdminPreview(value) {
    return String(value || "")
        .replace(/&/g,"&amp;").replace(/</g,"&lt;")
        .replace(/>/g,"&gt;").replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");
}

function previewImage(input, previewId) {
    const preview = document.getElementById(previewId);
    const file = input?.files?.[0];
    if (!preview) return;

    if (!file) {
        preview.innerHTML = "";
        preview.style.display = "none";
        return;
    }

    if (!file.type.startsWith("image/")) {
        previewSelectedFile(input, previewId);
        return;
    }

    const url = URL.createObjectURL(file);
    preview.style.display = "block";
    preview.innerHTML = `
        <div class="admin-local-preview">
            <img src="${url}" alt="Selected image preview">
            <div class="admin-preview-name">${escapeAdminPreview(file.name)}</div>
            <small>${Math.round(file.size/1024)} KB</small>
        </div>`;
}

function previewSelectedFile(input, previewId) {
    const preview = document.getElementById(previewId);
    const file = input?.files?.[0];
    if (!preview) return;

    if (!file) {
        preview.innerHTML = "";
        preview.style.display = "none";
        return;
    }

    const url = URL.createObjectURL(file);
    const type = (file.type || "").toLowerCase();
    const name = file.name || "Selected file";
    preview.style.display = "block";

    if (type.startsWith("image/")) {
        preview.innerHTML = `
            <div class="admin-local-preview">
                <img src="${url}" alt="Selected image preview">
                <div class="admin-preview-name">${escapeAdminPreview(name)}</div>
            </div>`;
    } else if (type === "application/pdf" || /\.pdf$/i.test(name)) {
        preview.innerHTML = `
            <div class="admin-local-preview">
                <iframe src="${url}" title="Selected PDF preview" class="admin-preview-pdf-local"></iframe>
                <div class="admin-preview-name"><i class="fa-solid fa-file-pdf"></i> ${escapeAdminPreview(name)}</div>
            </div>`;
    } else if (type.startsWith("video/")) {
        preview.innerHTML = `
            <div class="admin-local-preview">
                <video src="${url}" controls playsinline class="admin-preview-video-local"></video>
                <div class="admin-preview-name">${escapeAdminPreview(name)}</div>
            </div>`;
    } else {
        preview.innerHTML = `
            <div class="admin-local-preview admin-generic-file">
                <i class="fa-solid fa-file-lines"></i>
                <strong>${escapeAdminPreview(name)}</strong>
                <small>${escapeAdminPreview(file.type || "Document")}</small>
                <span>${Math.round(file.size/1024)} KB</span>
            </div>`;
    }
}

function previewAdminFile(url, title, type) {
    if (!url) {
        showWarning("No file is available for preview.");
        return;
    }

    const safeUrl = String(url).replace(/"/g, "&quot;");
    const name = title || "Preview";
    const kind = String(type || "").toLowerCase();

    if (kind.includes("image") || /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i.test(url)) {
        Swal.fire({
            title: escapeAdminPreview(name),
            html: `<div class="admin-preview-frame"><img src="${safeUrl}" class="admin-preview-image" alt="Preview"></div>`,
            width: "850px",
            confirmButtonText: "Close"
        });
        return;
    }

    if (kind.includes("pdf") || /\.pdf(\?|$)/i.test(url)) {
        Swal.fire({
            title: escapeAdminPreview(name),
            html: `<iframe src="${safeUrl}" class="admin-preview-pdf" title="PDF preview"></iframe>`,
            width: "95%",
            confirmButtonText: "Close"
        });
        return;
    }

    Swal.fire({
        title: escapeAdminPreview(name),
        html: `
          <div style="padding:20px;text-align:center">
            <i class="fa-solid fa-file-lines" style="font-size:48px;color:#6A1B9A"></i>
            <p>${escapeAdminPreview(name)}</p>
            <a href="${safeUrl}" target="_blank" rel="noopener noreferrer"
               style="display:inline-flex;padding:10px 16px;border-radius:22px;background:#6A1B9A;color:#fff;text-decoration:none">
               Open File
            </a>
          </div>`,
        width: "520px",
        confirmButtonText: "Close"
    });
}
