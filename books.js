// ======================================
// L-TUTOR STUDENT BOOKS
// Robust Cloudinary file handling
// ======================================

let allBooks = [];

document.addEventListener("DOMContentLoaded", loadBooks);

async function loadBooks(){

    const container = document.getElementById("booksContainer");
    if(!container) return;

    container.innerHTML = `
        <div class="empty-books">
            <i class="fa-solid fa-spinner fa-spin"></i>
            <p>Loading books...</p>
        </div>
    `;

    try{
        const snapshot = await db.collection("books").get();

        allBooks = [];
        snapshot.forEach(function(doc){
            allBooks.push({id:doc.id, ...doc.data()});
        });

        allBooks.sort(function(a,b){
            return String(a.title || "").localeCompare(String(b.title || ""));
        });

        displayBooks(allBooks);

    }catch(error){
        console.error("Books loading error:", error);
        container.innerHTML = `
            <div class="empty-books">
                <i class="fa-solid fa-circle-exclamation"></i>
                <p>Unable to load books.</p>
            </div>
        `;
    }
}

function getBookFileUrl(book){
    return String(
        book.pdfURL ||
        book.pdfUrl ||
        book.fileURL ||
        book.fileUrl ||
        book.link ||
        book.url ||
        ""
    ).trim();
}

function getBookDownloadUrl(url){
    if(!url) return "";
    // Cloudinary supports fl_attachment for forced downloads.
    if(url.includes("res.cloudinary.com") && url.includes("/upload/") &&
       !url.includes("/fl_attachment/")){
        return url.replace("/upload/","/upload/fl_attachment/");
    }
    return url;
}

function displayBooks(books){

    const container = document.getElementById("booksContainer");
    if(!container) return;

    if(!books || books.length===0){
        container.innerHTML = `
            <div class="empty-books">
                <i class="fa-solid fa-folder-open"></i>
                <h3>No books found.</h3>
            </div>
        `;
        return;
    }

    let html="";

    books.forEach(function(book,index){

        const fileUrl = getBookFileUrl(book);
        const downloadUrl = getBookDownloadUrl(fileUrl);
        const cover = book.cover || "images/book-cover.svg";

        html += `
            <article class="book-card fade-up"
                style="animation-delay:${index * 0.08}s">

                <img
                    class="book-cover"
                    src="${escapeBookAttribute(cover)}"
                    alt="${escapeBookAttribute(book.title || "Book")}"
                    onerror="this.src='images/book-cover.svg'"
                >

                <h3 class="book-title">
                    ${escapeBookText(book.title || "Untitled Book")}
                </h3>

                <p class="book-author">
                    ${escapeBookText(book.author || "Unknown Author")}
                </p>

                ${book.edition ? `<small>${escapeBookText(book.edition)}</small>` : ""}

                <div class="book-buttons">

                    ${
                        fileUrl
                        ? `
                        <a
                            class="view-btn"
                            href="file-viewer.html?url=${encodeURIComponent(fileUrl)}&title=${encodeURIComponent(book.title || "Book")}&type=${encodeURIComponent(book.fileType || (String(fileUrl).toLowerCase().includes(".pdf") ? "pdf" : ""))}">
                            <i class="fa-solid fa-eye"></i>
                            View
                        </a>

                        <a
                            class="download-btn"
                            href="${escapeBookAttribute(downloadUrl)}"
                            target="_blank"
                            rel="noopener noreferrer"
                            download>
                            <i class="fa-solid fa-download"></i>
                            Download
                        </a>
                        `
                        : `
                        <span class="file-unavailable">
                            <i class="fa-solid fa-circle-exclamation"></i>
                            File unavailable
                        </span>
                        `
                    }

                </div>
            </article>
        `;
    });

    container.innerHTML=html;

    if(typeof window.refreshAnimations==="function"){
        window.refreshAnimations(container);
    }
}

function searchBooks(){

    const input=document.getElementById("searchBook");
    if(!input) return;

    const keyword=input.value.trim().toLowerCase();

    displayBooks(
        allBooks.filter(function(book){
            return (
                String(book.title || "").toLowerCase().includes(keyword) ||
                String(book.author || "").toLowerCase().includes(keyword) ||
                String(book.courseCode || book.course || "").toLowerCase().includes(keyword) ||
                String(book.edition || "").toLowerCase().includes(keyword)
            );
        })
    );
}

function escapeBookText(value){
    return String(value || "")
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");
}

function escapeBookAttribute(value){
    return escapeBookText(value);
}
