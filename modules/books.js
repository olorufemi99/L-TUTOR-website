// ======================================
// L-TUTOR
// RECOMMENDED BOOKS v3.0
// PART 1
// ======================================

let editingBook=false;
let editingBookId=null;

function loadBooksModule(){

pageTitle.innerHTML="Recommended Books";

pageSubtitle.innerHTML="Manage departmental books.";

contentArea.innerHTML=`

<div class="panel">

<h2>

<i class="fa-solid fa-book-open"></i>

Add Recommended Book

</h2>

<div class="form-grid">

<div class="form-group">

<label>Course</label>

<select id="bookCourse">

<option>Loading Courses...</option>

</select>

</div>

<div class="form-group">

<label>Book Title</label>

<input
type="text"
id="bookTitle"
placeholder="Public Administration">

</div>

<div class="form-group">

<label>Author</label>

<input
type="text"
id="bookAuthor"
placeholder="Prof. Fatile">

</div>

<div class="form-group">

<label>Edition</label>

<input
type="text"
id="bookEdition"
placeholder="3rd Edition">

</div>

<div class="form-group">

<label>Description</label>

<textarea
id="bookDescription"
placeholder="Brief description..."></textarea>

</div>

</div>

<div class="form-group">

<label>Book Cover</label>

<label class="upload-box">

<input

type="file"

id="bookCover"

accept="image/*"

onchange="previewImage(this,'bookPreview')">

<i class="fa-solid fa-image"></i>

<h4>Upload Book Cover</h4>

<p>Click to choose image</p>

</label>

<div

id="bookPreview"

class="upload-preview">

</div>

</div>

<div class="form-group">

<label>Book PDF</label>

<label class="upload-box">

<input

type="file"

id="bookFile"

accept=".pdf"

onchange="previewSelectedFile(this,'bookFilePreview')">

<i class="fa-solid fa-file-pdf"></i>

<h4>Upload PDF</h4>

<p>Click to choose PDF</p>

</label>

<div

id="bookFilePreview"

class="upload-preview">

</div>

<div

id="bookUploadStatus"

class="upload-success"

style="display:none;">

</div>

</div>

<button

class="save-btn"

id="saveBookBtn"

onclick="saveBook()">

<i class="fa-solid fa-floppy-disk"></i>

Save Book

</button>

</div>

<div class="panel">

<h2>

<i class="fa-solid fa-book"></i>

Recommended Books

</h2>

<div class="search-box">

<i class="fa-solid fa-magnifying-glass"></i>

<input

type="text"

id="bookSearch"

placeholder="Search Books..."

onkeyup="searchBooks()">

</div>

<table>

<thead>

<tr>

<th>Cover</th>

<th>Course</th>

<th>Title</th>

<th>Author</th>

<th>Actions</th>

</tr>

</thead>

<tbody id="bookTable">

<tr>

<td colspan="5">

Loading Books...

</td>

</tr>

</tbody>

</table>

</div>

`;

loadBookCourseDropdown();

loadBooks();

}
// ======================================
// LOAD COURSE DROPDOWN
// ======================================

function loadBookCourseDropdown(){

const dropdown=document.getElementById("bookCourse");

dropdown.innerHTML="";

coursesRef

.orderBy("courseCode")

.get()

.then(function(snapshot){

snapshot.forEach(function(doc){

const c=doc.data();

dropdown.innerHTML+=`

<option value="${c.courseCode}">

${c.courseCode} - ${c.courseTitle}

</option>

`;

});

});

}

// ======================================
// LOAD BOOKS
// ======================================

function loadBooks(){

const table=document.getElementById("bookTable");

table.innerHTML="";

booksRef

.orderBy("createdAt","desc")

.get()

.then(function(snapshot){

if(snapshot.empty){

table.innerHTML=`

<tr>

<td colspan="5">

No Books Added.

</td>

</tr>

`;

return;

}

snapshot.forEach(function(doc){

const book=doc.data();

table.innerHTML+=`

<tr>

<td>

<img
src="${book.cover || "images/book-cover.png"}"
class="table-avatar"
style="cursor:pointer"
onclick="previewAdminFile('${String(book.cover || "").replace(/'/g,"\\'")}','${String(book.title || "Book Cover").replace(/'/g,"\\'")}','image')">

</td>

<td>${book.courseCode}</td>

<td>${book.title}</td>

<td>${book.author}</td>

<td>

<button

class="edit-btn"

onclick="editBook('${doc.id}')">

Edit

</button>

${
book.pdfURL
?
`<button class="table-preview-btn"
onclick="previewAdminFile('${String(book.pdfURL).replace(/'/g,"\\'")}','${String(book.title || "Book").replace(/'/g,"\\'")}','pdf')">
<i class="fa-solid fa-eye"></i> Preview
</button>`
: ""
}

<button

class="delete-btn"

onclick="deleteBook('${doc.id}')">

Delete

</button>

</td>

</tr>

`;

});

});

}
// ======================================
// SAVE BOOK
// ======================================

async function saveBook(){

try{

let coverURL="";
let pdfURL="";
let pdfName="";

const cover=document.getElementById("bookCover").files[0];
const pdf=document.getElementById("bookFile").files[0];

if(cover){

const uploadedCover=await uploadFile(cover);
coverURL=uploadedCover.url;

}

if(pdf){

const uploadedPDF=await uploadFile(pdf);

pdfURL=uploadedPDF.url;
pdfName=uploadedPDF.originalName;

}

const book={

courseCode:bookCourse.value,

title:bookTitle.value.trim(),

author:bookAuthor.value.trim(),

edition:bookEdition.value.trim(),

description:bookDescription.value.trim(),

updatedAt:firebase.firestore.FieldValue.serverTimestamp()

};

if(coverURL!="") book.cover=coverURL;

if(pdfURL!=""){

book.pdfURL=pdfURL;
book.pdfName=pdfName;
book.fileType=(uploadedPDF && uploadedPDF.type) || "application/pdf";

}

if(

book.courseCode==""||

book.title==""||

book.author==""

){

showWarning("Please complete all required fields.");

return;

}

if(editingBook){

if(!cover){

const doc=await booksRef.doc(editingBookId).get();

book.cover=doc.data().cover;

}

if(!pdf){

const doc=await booksRef.doc(editingBookId).get();

book.pdfURL=doc.data().pdfURL;
book.pdfName=doc.data().pdfName;
book.fileType=doc.data().fileType || "application/pdf";

}

await booksRef.doc(editingBookId).update(book);

showSuccess("Book Updated Successfully.");

editingBook=false;
editingBookId=null;

document.getElementById("saveBookBtn").innerHTML=

'<i class="fa-solid fa-floppy-disk"></i> Save Book';

}else{

book.createdAt=

firebase.firestore.FieldValue.serverTimestamp();

await booksRef.add(book);

showSuccess("Book Added Successfully.");

}

document.getElementById("bookTitle").value="";
document.getElementById("bookAuthor").value="";
document.getElementById("bookEdition").value="";
document.getElementById("bookDescription").value="";
document.getElementById("bookCover").value="";
document.getElementById("bookFile").value="";

document.getElementById("bookPreview").style.display="none";
document.getElementById("bookFilePreview").style.display="none";

loadBooks();

}catch(error){

showError(error.message);

}

}
// ======================================
// EDIT BOOK
// ======================================

function editBook(id){

booksRef

.doc(id)

.get()

.then(function(doc){

const book=doc.data();

editingBook=true;
editingBookId=id;

bookCourse.value=book.courseCode;
bookTitle.value=book.title;
bookAuthor.value=book.author;
bookEdition.value=book.edition||"";
bookDescription.value=book.description||"";

document.getElementById("saveBookBtn").innerHTML=

'<i class="fa-solid fa-pen"></i> Update Book';

showSuccess("Book loaded for editing.");

});

}

// ======================================
// DELETE BOOK
// ======================================

function deleteBook(id){

showConfirm(

"Delete Book",

"Delete this recommended book?"

)

.then((result)=>{

if(!result.isConfirmed) return;

booksRef

.doc(id)

.delete()

.then(function(){

showSuccess("Book Deleted Successfully.");

loadBooks();

});

});

}

// ======================================
// SEARCH BOOKS
// ======================================

function searchBooks(){

const search=document

.getElementById("bookSearch")

.value

.toUpperCase();

const rows=document

.querySelectorAll("#bookTable tr");

rows.forEach(function(row){

const text=row.innerText.toUpperCase();

row.style.display=

text.includes(search)

?

""

:

"none";

});

}
