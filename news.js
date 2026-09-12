// ==========================================
// L-TUTOR HOME NEWS
// Automatic RIGHT -> LEFT carousel + touch swipe
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
    return new Promise(r => setTimeout(r, 150)).then(() => waitForDB(attempt + 1));
  }

  function safe(value) {
    return String(value || "").replace(/&/g,"&amp;").replace(/</g,"&lt;")
      .replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
  }

  function getTime(news) {
    const v = news.createdAt || news.updatedAt;
    if (v && typeof v.toMillis === "function") return v.toMillis();
    if (v && typeof v.seconds === "number") return v.seconds * 1000;
    if (typeof v === "string") { const t = Date.parse(v); if (!isNaN(t)) return t; }
    if (news.date) { const t = Date.parse(news.date); if (!isNaN(t)) return t; }
    return 0;
  }

  function formatDate(news) {
    if (news.date) return news.date;
    const t = getTime(news);
    return t ? new Date(t).toLocaleDateString("en-GB") : "";
  }

  function installCarouselStyle() {
    if (document.getElementById("ltutor-home-news-carousel-style")) return;
    const style = document.createElement("style");
    style.id = "ltutor-home-news-carousel-style";
    style.textContent = `
      #announcementContainer.lt-news-carousel{
        display:block!important; overflow:hidden!important; width:100%!important;
        min-width:0!important; position:relative!important; touch-action:pan-y!important;
      }
      #announcementContainer.lt-news-carousel .lt-news-track{
        display:flex!important; flex-wrap:nowrap!important; align-items:stretch!important;
        width:max-content!important; gap:25px!important; transform:translate3d(0,0,0);
        will-change:transform; user-select:none; -webkit-user-select:none;
      }
      #announcementContainer.lt-news-carousel .announcement-card{
        flex:0 0 300px!important; width:300px!important; min-width:300px!important;
        margin:0!important; box-sizing:border-box!important; cursor:pointer!important;
      }
      #announcementContainer.lt-news-carousel .announcement-card a{pointer-events:none!important;}
      @media(max-width:768px){
        #announcementContainer.lt-news-carousel .lt-news-track{gap:20px!important;}
        #announcementContainer.lt-news-carousel .announcement-card{
          flex-basis:min(82vw,330px)!important; width:min(82vw,330px)!important;
          min-width:min(82vw,330px)!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function startCarousel(container, cards) {
    installCarouselStyle();
    container.classList.add("lt-news-carousel");
    container.innerHTML = '<div class="lt-news-track">' + cards.join("") + cards.join("") + '</div>';
    const track = container.querySelector(".lt-news-track");
    if (!track) return;

    let x = 0, last = performance.now(), paused = false, dragging = false;
    let startX = 0, startOffset = 0, moved = false;
    let cycleWidth = 0;
    const speed = 42; // pixels per second, smooth and deliberately slow

    function measure() {
      cycleWidth = track.scrollWidth / 2;
      if (!cycleWidth || !isFinite(cycleWidth)) cycleWidth = 1;
    }
    measure();
    window.addEventListener("resize", measure);

    function wrap() {
      if (cycleWidth <= 0) return;
      while (x <= -cycleWidth) x += cycleWidth;
      while (x > 0) x -= cycleWidth;
    }

    function render() { track.style.transform = `translate3d(${x}px,0,0)`; }

    function frame(now) {
      const dt = Math.min(60, now - last) / 1000;
      last = now;
      if (!paused && !dragging) {
        x -= speed * dt;
        wrap(); render();
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    track.addEventListener("pointerdown", function (e) {
      dragging = true; paused = true; moved = false;
      startX = e.clientX; startOffset = x;
      try { track.setPointerCapture(e.pointerId); } catch (_) {}
    });

    track.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 6) moved = true;
      x = startOffset + dx;
      wrap(); render();
    });

    function finishPointer(e) {
      if (!dragging) return;
      dragging = false; paused = false;
      if (moved) {
        // Prevent the click generated after a swipe from opening a story.
        setTimeout(() => { moved = false; }, 80);
      }
      try { track.releasePointerCapture(e.pointerId); } catch (_) {}
    }
    track.addEventListener("pointerup", finishPointer);
    track.addEventListener("pointercancel", finishPointer);
    track.addEventListener("pointerleave", function () { if (dragging) return; });

    track.addEventListener("click", function (e) {
      if (moved) { e.preventDefault(); return; }
      const card = e.target.closest(".announcement-card[data-news-id]");
      if (card) window.location.href = "news.html?id=" + encodeURIComponent(card.dataset.newsId);
    });
  }

  window.loadStudentNews = async function () {
    const container = document.getElementById("announcementContainer");
    const ticker = document.getElementById("topNewsTicker");
    if (!container && !ticker) return;
    if (container) container.innerHTML = '<div class="news-loading"><i class="fa-solid fa-spinner fa-spin"></i><p>Loading latest news...</p></div>';

    try {
      const database = await waitForDB(0);
      const snapshot = await database.collection("news").get();
      const records = [];
      snapshot.forEach(doc => records.push({ id: doc.id, ...doc.data() }));
      records.sort((a,b) => getTime(b) - getTime(a));

      if (ticker) ticker.innerHTML = records.length
        ? `<a href="news.html?id=${encodeURIComponent(records[0].id)}" class="top-news-title">${safe(records[0].title || "Latest departmental news")}</a><span class="top-news-date">${safe(formatDate(records[0]))}</span>`
        : `<span>No news published yet.</span>`;

      if (!container) return;
      if (!records.length) { container.innerHTML = '<div class="news-empty"><i class="fa-solid fa-newspaper"></i><p>No news published yet.</p></div>'; return; }

      const cards = records.map(news => {
        const image = news.imageUrl || news.imageURL || news.image || "";
        return `<article class="announcement-card news-card" data-news-id="${safe(news.id)}" role="link" tabindex="0" aria-label="Read ${safe(news.title || "news")}">
          ${image ? `<div class="home-news-image" style="--news-image-bg:url('${safe(image)}')"><img src="${safe(image)}" alt="${safe(news.title || "News")}" loading="lazy"></div>` : ""}
          <div class="home-news-category">${safe(news.category || "News")}</div>
          <h3>${safe(news.title || "Untitled News")}</h3>
          <p>${safe(news.content || news.message || "")}</p>
          <small><i class="fa-solid fa-calendar"></i> ${safe(formatDate(news))}</small>
        </article>`;
      });

      startCarousel(container, cards);
    } catch (error) {
      console.error("Student home news error:", error);
      if (ticker) ticker.innerHTML = '<span>News is temporarily unavailable.</span>';
      if (container) container.innerHTML = `<div class="news-empty"><i class="fa-solid fa-triangle-exclamation"></i><p>Unable to load news right now.</p><button type="button" class="news-retry" onclick="loadStudentNews()">Try Again</button></div>`;
    }
  };

  document.addEventListener("DOMContentLoaded", window.loadStudentNews);
})();
