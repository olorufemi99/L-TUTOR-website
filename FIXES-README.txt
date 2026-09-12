L-TUTOR — FINAL STABILITY FIX

Fixed in this package:

1. VIDEO TUTORIALS
   - Fixed the "db is not defined" error.
   - Student video page now uses the shared Firebase/Firestore instance safely.
   - YouTube links continue to support youtu.be, watch, embed, shorts and live URLs.

2. ACADEMIC STAFF / LECTURERS
   - Fixed the global `db` redeclaration that stopped lecturers-page.js from running.
   - Removed the fragile Firestore orderBy(name) dependency and sort safely in JavaScript.
   - Added database/error handling so the page no longer stays on an unexplained loader.
   - Lecturer profile uses the same shared Firestore instance.

3. NEWS
   - Fixed the Firebase initialization chain that caused "Firestore is not initialized".
   - Home latest-news/ticker and the News page now read the same `news` collection.
   - Admin News module uses the shared Firestore instance for publish/edit/delete.

4. FIREBASE INITIALIZATION
   - Firebase initialization is now guarded against duplicate initialization.
   - `window.db` and global `db` are both available for the existing legacy modules.
   - `window.auth` and global `auth` are both available.

5. DARK MODE
   - Dark mode now covers the whole document instead of leaving white sections.
   - Added fixes for page headers, lecturer sections, news sections, footer, public navigation and desktop-site mode on phones.
   - Browser theme-color continues to follow the selected theme.

6. MOBILE PUBLIC NAVIGATION
   - Home, About, Courses, News and Contact use the same compact mobile header.
   - The mobile menu stays vertical and does not become a horizontal scrolling navigation.

7. LOGO
   - Public logo is forced to a compact 42px desktop / 38px mobile size.
   - Uses contain rendering so the circular LASU logo is not cropped or stretched.

8. SECURITY UX
   - Protected pages are hidden while Firebase Auth is being verified to prevent a visible protected-page flash when someone manually enters dashboard/admin URLs.
   - Firestore Security Rules remain the real security boundary; the client-side guards are only an additional UX layer.

Validation:
- All JavaScript files in this package pass Node syntax checking.
- Main HTML pages return HTTP 200 from a local static server.

IMPORTANT:
- The package still needs access to the existing Firebase project and deployed Firestore rules.
- Cloudinary uploads still require the existing Cloudinary upload preset/configuration.
- Firebase web configuration values are client-side configuration, not a replacement for Firestore Security Rules.
