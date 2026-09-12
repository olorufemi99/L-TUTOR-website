// ======================================
// L-TUTOR ADMIN NEWS MODULE
// ======================================

let editingNews = false;
let editingNewsId = null;

function loadNewsModule(){
    pageTitle.innerHTML = "News";
    pageSubtitle.innerHTML = "Publish and manage departmental news.";
    editingNews = false;
    editingNewsId = null;

    contentArea.innerHTML = `
    <div class="panel">
      <h2><i class="fa-solid fa-newspaper"></i> Publish News</h2>
      <div class="form-grid">
        <div class="form-group">
          <label>News Title</label>
          <input type="text" id="newsTitle" placeholder="Enter news title">
        </div>
        <div class="form-group">
          <label>Category</label>
          <select id="newsCategory">
            <option value="">Select Category</option>
            <option>Announcement</option><option>Academic</option>
            <option>Event</option><option>General</option>
          </select>
        </div>
        <div class="form-group">
          <label>News Date</label>
          <input type="date" id="newsDate">
        </div>
        <div class="form-group">
          <label>Author</label>
          <input type="text" id="newsAuthor" placeholder="Department / Administrator">
        </div>
      </div>
      <div class="form-group">
        <label>News Content</label>
        <textarea id="newsContent" rows="7" placeholder="Write the full news here..."></textarea>
      </div>
      <div class="form-group">
        <label>News Image (Optional)</label>
        <label class="upload-box">
          <input type="file" id="newsImage" accept="image/*" onchange="previewSelectedFile(this,'newsImagePreview')">
          <i class="fa-solid fa-image"></i>
          <h4>Upload News Image</h4>
          <p>JPG, PNG, WEBP and other common images</p>
        </label>
        <div id="newsImagePreview" class="upload-preview"></div>
      </div>
      <button class="save-btn" id="saveNewsBtn" onclick="saveNews()">
        <i class="fa-solid fa-paper-plane"></i> Publish News
      </button>
    </div>

    <div class="panel">
      <h2><i class="fa-solid fa-list"></i> Published News</h2>
      <div class="search-box">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input type="text" id="newsSearch" placeholder="Search news..." onkeyup="searchNews()">
      </div>
      <div class="table-wrapper">
        <table>
          <thead><tr><th>Title</th><th>Category</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody id="newsTable"><tr><td colspan="4">Loading News...</td></tr></tbody>
        </table>
      </div>
    </div>`;

    loadNews();
}

function getNewsTime(news){
    const value = news.createdAt || news.updatedAt;
    if(value && typeof value.toMillis === "function") return value.toMillis();
    if(value && typeof value.seconds === "number") return value.seconds * 1000;
    if(typeof value === "string"){
        const t = Date.parse(value);
        if(!Number.isNaN(t)) return t;
    }
    if(news.date){
        const t = Date.parse(news.date);
        if(!Number.isNaN(t)) return t;
    }
    return 0;
}

function escapeNewsText(value){
    return String(value || "")
      .replace(/&/g,"&amp;").replace(/</g,"&lt;")
      .replace(/>/g,"&gt;").replace(/"/g,"&quot;")
      .replace(/'/g,"&#039;");
}

async function loadNews(){
    const table = document.getElementById("newsTable");
    if(!table) return;

    table.innerHTML = `<tr><td colspan="4">Loading News...</td></tr>`;

    try{
        if(!window.db) throw new Error("Firestore is not initialized. Please refresh the page.");
        const snapshot = await window.db.collection("news").get();
        const records = [];
        snapshot.forEach(doc => records.push({id:doc.id, data:doc.data()}));
        records.sort((a,b)=>getNewsTime(b.data)-getNewsTime(a.data));

        if(!records.length){
            table.innerHTML = `<tr><td colspan="4">No News Published Yet.</td></tr>`;
            return;
        }

        table.innerHTML = records.map(record => {
            const n = record.data;
            return `<tr>
              <td>${escapeNewsText(n.title || "--")}</td>
              <td>${escapeNewsText(n.category || "--")}</td>
              <td>${escapeNewsText(n.date || "--")}</td>
              <td>
                <button class="edit-btn" onclick="editNews('${record.id}')"><i class="fa-solid fa-pen"></i> Edit</button>
                <button class="delete-btn" onclick="deleteNews('${record.id}')"><i class="fa-solid fa-trash"></i> Delete</button>
              </td>
            </tr>`;
        }).join("");
    }catch(error){
        console.error("Admin news load error:", error);
        table.innerHTML = `<tr><td colspan="4">${escapeNewsText(error.message)}</td></tr>`;
    }
}

async function saveNews(){
    const title = document.getElementById("newsTitle")?.value.trim();
    const category = document.getElementById("newsCategory")?.value;
    const date = document.getElementById("newsDate")?.value;
    const author = document.getElementById("newsAuthor")?.value.trim();
    const content = document.getElementById("newsContent")?.value.trim();
    const imageInput = document.getElementById("newsImage");
    const button = document.getElementById("saveNewsBtn");

    if(!title || !category || !content){
        showWarning("Please complete the required fields.");
        return;
    }

    try{
        if(!window.db) throw new Error("Firestore is not initialized. Please refresh the page.");
        if(!window.auth || !auth.currentUser) throw new Error("You are not signed in as an administrator.");

        button.disabled = true;
        button.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${editingNews ? "Updating..." : "Publishing..."}`;

        const data = {
            title,
            category,
            date: date || new Date().toISOString().slice(0,10),
            author: author || "Department",
            content,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        if(imageInput?.files?.length){
            const uploaded = await uploadFile(imageInput.files[0]);
            data.imageUrl = uploaded.url;
            data.imageName = uploaded.originalName || "";
            data.imagePublicId = uploaded.publicId || "";
        }

        if(editingNews){
            await window.db.collection("news").doc(editingNewsId).update(data);
            showSuccess("News Updated Successfully.");
        }else{
            data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await window.db.collection("news").add(data);
            showSuccess("News Published Successfully.");
        }

        resetNewsForm();
        await loadNews();
    }catch(error){
        console.error("Admin news save error:", error);
        showError(error.message || "Unable to save news.");
    }finally{
        if(button){
            button.disabled = false;
            button.innerHTML = `<i class="fa-solid fa-paper-plane"></i> ${editingNews ? "Update News" : "Publish News"}`;
        }
    }
}

async function editNews(id){
    try{
        const doc = await window.db.collection("news").doc(id).get();
        if(!doc.exists){ showError("News no longer exists."); return; }
        const news = doc.data();
        editingNews = true;
        editingNewsId = id;
        document.getElementById("newsTitle").value = news.title || "";
        document.getElementById("newsCategory").value = news.category || "";
        document.getElementById("newsDate").value = news.date || "";
        document.getElementById("newsAuthor").value = news.author || "";
        document.getElementById("newsContent").value = news.content || "";
        const preview = document.getElementById("newsImagePreview");
        if(preview && news.imageUrl){
            preview.style.display = "block";
            preview.innerHTML = `<img src="${escapeNewsText(news.imageUrl)}" alt="Current news image" style="max-width:100%;max-height:180px;border-radius:10px"><small>Current image. Choose a new image to replace it.</small>`;
        }
        document.getElementById("saveNewsBtn").innerHTML = `<i class="fa-solid fa-pen"></i> Update News`;
        window.scrollTo({top:0,behavior:"smooth"});
    }catch(error){ showError(error.message); }
}

function deleteNews(id){
    showConfirm("Delete News","Are you sure you want to delete this news?").then(async result=>{
        if(!result.isConfirmed) return;
        try{
            await window.db.collection("news").doc(id).delete();
            showSuccess("News Deleted Successfully.");
            loadNews();
        }catch(error){ showError(error.message); }
    });
}

function searchNews(){
    const input = document.getElementById("newsSearch");
    if(!input) return;
    const keyword = input.value.trim().toLowerCase();
    document.querySelectorAll("#newsTable tr").forEach(row=>{
        row.style.display = row.innerText.toLowerCase().includes(keyword) ? "" : "none";
    });
}

function resetNewsForm(){
    editingNews = false;
    editingNewsId = null;
    ["newsTitle","newsCategory","newsDate","newsAuthor","newsContent"].forEach(id=>{
        const el=document.getElementById(id); if(el) el.value="";
    });
    const image=document.getElementById("newsImage"); if(image) image.value="";
    const preview=document.getElementById("newsImagePreview");
    if(preview){ preview.innerHTML=""; preview.style.display="none"; }
}
