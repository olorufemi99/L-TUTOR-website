// ======================================
// L-TUTOR
// HOME ANNOUNCEMENTS
// ======================================

const announcementContainer =
document.getElementById("announcementContainer");

db.collection("announcements")
.orderBy("createdAt","desc")
.limit(5)
.get()

.then(function(snapshot){

    if(snapshot.empty){

        announcementContainer.innerHTML =
        "<p>No announcements available.</p>";

        return;

    }

    const cards = [];

    snapshot.forEach(function(doc){

        const announcement = doc.data();

        cards.push(`

        <div class="announcement-card">

            <h3>${announcement.title}</h3>

            <p>${announcement.message}</p>

            <small>
                ${
                announcement.createdAt
                ?
                new Date(
                announcement.createdAt.seconds * 1000
                ).toLocaleDateString()
                :
                ""
                }
            </small>

        </div>

        `);

    });

    // Keep the existing card design exactly as it is. The track simply
    // duplicates the cards so it can move continuously from RIGHT to LEFT.
    announcementContainer.classList.add("lt-news-scroll");
    announcementContainer.innerHTML =
        '<div class="lt-news-scroll-track">' +
        cards.join("") + cards.join("") +
        '</div>';

})

.catch(function(error){

    console.log(error);

    announcementContainer.innerHTML =
    "<p>Unable to load announcements.</p>";

});