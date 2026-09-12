// ==========================================
// L-TUTOR PUBLIC NEWS PAGE
// List view + full individual news article
// ==========================================
(function () {
  "use strict";

  function getDB() {
    if (window.db && typeof window.db.collection === "function") return window.db;
    if (window.firebase && firebase.apps && firebase.apps.length) {
      try { window.db = firebase.firestore(); return window.db; } catch (e) {}
    }
    return null;
  }
  function waitForDB(attempt) {
    const db = getDB();
    if (db) return Promise.resolve(db);
    if (attempt >= 30) return Promise.reject(new Error("Firestore is not initialized."));
    return new Promise(r => setTimeout(r,150)).then(() => waitForDB(attempt+1));
  }
  function safe(v){return String(v||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");}
  function time(n){const v=n.createdAt||n.updatedAt;if(v&&typeof v.toMillis==="function")return v.toMillis();if(v&&typeof v.seconds==="number")return v.seconds*1000;if(typeof v==="string"){const t=Date.parse(v);if(!isNaN(t))return t;}if(n.date){const t=Date.parse(n.date);if(!isNaN(t))return t;}return 0;}
  function date(n){if(n.date)return n.date;const t=time(n);return t?new Date(t).toLocaleDateString("en-GB"):"";}

  function installStyle(){
    if(document.getElementById("ltutor-full-news-style"))return;
    const s=document.createElement("style");s.id="ltutor-full-news-style";s.textContent=`
      .news-detail{max-width:900px;margin:0 auto 70px;background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:30px;box-shadow:var(--shadow)}
      .news-detail-image{width:100%;max-height:520px;border-radius:16px;overflow:hidden;background:#f3e5f5;margin-bottom:25px}
      .news-detail-image img{width:100%;height:auto;max-height:520px;display:block;object-fit:contain;margin:auto}
      .news-detail .news-category{display:inline-block;margin-bottom:12px;padding:6px 11px;border-radius:20px;background:#f3e5f5;color:#6A1B9A;font-size:12px;font-weight:600}
      .news-detail h2{font-size:34px;margin:10px 0 12px;color:var(--text)}
      .news-detail .news-date{color:var(--primary);font-weight:600;margin-bottom:22px}
      .news-detail .news-body{color:var(--text2);line-height:2;font-size:16px;white-space:pre-line}
      .news-detail .news-author{display:block;color:var(--text2);margin-top:22px}
      .news-back{display:inline-block;margin-top:28px;color:var(--primary);font-weight:600;text-decoration:none}
      @media(max-width:768px){.news-detail{margin:0 5% 50px;padding:20px}.news-detail h2{font-size:27px}.news-detail-image{max-height:none}.news-detail-image img{max-height:none}}
    `;document.head.appendChild(s);
  }

  window.loadNewsPage=async function(){
    const container=document.getElementById("newsPageContainer");if(!container)return;
    installStyle();container.innerHTML='<div class="news-loading"><i class="fa-solid fa-spinner fa-spin"></i><p>Loading latest news...</p></div>';
    try{
      const db=await waitForDB(0), id=new URLSearchParams(location.search).get("id");
      if(id){
        const doc=await db.collection("news").doc(id).get();
        if(!doc.exists){container.innerHTML='<div class="news-empty"><p>News article not found.</p><a class="news-back" href="news.html">← Back to all news</a></div>';return;}
        const n={id:doc.id,...doc.data()},image=n.imageUrl||n.imageURL||n.image||"";
        container.innerHTML=`<article class="news-detail">
          ${image?`<div class="news-detail-image"><img src="${safe(image)}" alt="${safe(n.title||"News")}"></div>`:""}
          <div class="news-category">${safe(n.category||"News")}</div>
          <div class="news-date"><i class="fa-solid fa-calendar"></i> ${safe(date(n))}</div>
          <h2>${safe(n.title||"Untitled News")}</h2>
          ${n.author?`<small class="news-author">By ${safe(n.author)}</small>`:""}
          <div class="news-body">${safe(n.content||n.message||"No article content available.")}</div>
          <a class="news-back" href="news.html">← Back to all news</a>
        </article>`;
        return;
      }
      const snap=await db.collection("news").get(),records=[];snap.forEach(d=>records.push({id:d.id,...d.data()}));records.sort((a,b)=>time(b)-time(a));
      if(!records.length){container.innerHTML='<div class="news-empty"><i class="fa-solid fa-newspaper"></i><p>No news published yet.</p></div>';return;}
      container.innerHTML=records.map(n=>{const image=n.imageUrl||n.imageURL||n.image||"";return `<article class="news-card lt-reveal" data-news-id="${safe(n.id)}" style="cursor:pointer" onclick="location.href='news.html?id=${encodeURIComponent(n.id)}'">
        ${image?`<div class="news-image" style="--news-page-image-bg:url('${safe(image)}')"><img src="${safe(image)}" alt="${safe(n.title||"News")}" loading="lazy"></div>`:""}
        <div class="news-category">${safe(n.category||"News")}</div><div class="news-date"><i class="fa-solid fa-calendar"></i> ${safe(date(n))}</div>
        <h2>${safe(n.title||"Untitled News")}</h2><p>${safe(n.content||n.message||"")}</p>${n.author?`<small>${safe(n.author)}</small>`:""}
      </article>`}).join("");
    }catch(error){console.error(error);container.innerHTML=`<div class="news-empty"><i class="fa-solid fa-triangle-exclamation"></i><p>Unable to load news.</p><button class="news-retry" onclick="loadNewsPage()">Try Again</button></div>`;}
  };
  document.addEventListener("DOMContentLoaded",window.loadNewsPage);
})();
