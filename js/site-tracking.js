// ============================================================
// 505th Site Analytics Tracker — site-tracking.js
// Include on every public page:
//   <script type="module" src="site-tracking.js"></script>
// ============================================================

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { getFirestore, addDoc, collection } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCYWrWE8-xBJsvh228xzcg5VOD7dIn48fg",
    authDomain: "th-website-91533.firebaseapp.com",
    projectId: "th-website-91533",
    storageBucket: "th-website-91533.firebasestorage.app",
    messagingSenderId: "1046139150142",
    appId: "1:1046139150142:web:01f409ae4a38c4f79d966f"
};

(function () {
    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    // Derive page ID from URL
    const pagePath = window.location.pathname.split('/').pop() || 'home.html';
    const pageId = pagePath.replace('.html', '') || 'home';

    // Don't track admin/login pages
    if (['admin', 'login'].includes(pageId)) return;

    // Session ID — groups multiple page views in one visit
    const sessionId = sessionStorage.getItem('505_sid') || (() => {
        const id = Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('505_sid', id);
        return id;
    })();

    // Wait for auth state, then record view
    onAuthStateChanged(auth, async (user) => {
        try {
            await addDoc(collection(db, 'page_views'), {
                page: pageId,
                timestamp: new Date().toISOString(),
                userId: user ? user.uid : null,
                isGuest: !user,
                referrer: document.referrer || null,
                userAgent: navigator.userAgent,
                sessionId: sessionId
            });
        } catch (e) {
            // Silent fail — never disrupt the visitor
        }
    });
})();
