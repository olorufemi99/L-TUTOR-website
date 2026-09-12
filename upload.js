// ==========================================
// L-TUTOR UNIVERSAL CLOUDINARY UPLOAD
// Images + PDF + DOC + DOCX
// ==========================================

async function uploadFile(file) {
    if (!file) throw new Error("No file selected.");

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
        throw new Error("File is too large. Maximum size is 50MB.");
    }

    const name = String(file.name || "");
    const lower = name.toLowerCase();
    const extension = lower.includes(".") ? lower.split(".").pop() : "";

    const image = !!(file.type && file.type.toLowerCase().startsWith("image/"));
    const document = ["pdf","doc","docx"].includes(extension);

    if (!image && !document) {
        throw new Error("Allowed files: PDF, DOC, DOCX and images.");
    }

    // IMPORTANT:
    // Cloudinary PDFs/DOC/DOCX must be uploaded through /raw/upload.
    // Images use /image/upload.
    const resourceType = image ? "image" : "raw";

    const uploadURL =
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", "L-TUTOR");

    let response;
    try {
        response = await fetch(uploadURL, {
            method: "POST",
            body: formData
        });
    } catch (error) {
        console.error("Cloudinary network error:", error);
        throw new Error("Unable to connect to Cloudinary. Check your internet connection.");
    }

    let result;
    try {
        result = await response.json();
    } catch (error) {
        console.error("Cloudinary invalid response:", error);
        throw new Error("Cloudinary returned an invalid response.");
    }

    if (!response.ok) {
        console.error("Cloudinary upload failed:", result);
        throw new Error(result?.error?.message || "Cloudinary upload failed.");
    }

    const url = result.secure_url || result.url;
    if (!url) throw new Error("Cloudinary uploaded the file but returned no URL.");

    return {
        url,
        originalName: file.name,
        type: file.type || (extension === "pdf" ? "application/pdf" : ""),
        size: file.size,
        publicId: result.public_id || "",
        resourceType: result.resource_type || resourceType,
        format: result.format || extension
    };
}
