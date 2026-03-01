// ===== 505th CMS - Reads page content from Firestore =====
// Add to any page that has editable content slots
// Requires: data-cms-page on <body>, data-cms-slot on editable elements

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCYWrWE8-xBJsvh228xzcg5VOD7dIn48fg",
    authDomain: "th-website-91533.firebaseapp.com",
    projectId: "th-website-91533",
    storageBucket: "th-website-91533.firebasestorage.app",
    messagingSenderId: "1046139150142",
    appId: "1:1046139150142:web:01f409ae4a38c4f79d966f"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

(async function loadCmsContent() {
    const pageId = document.body.getAttribute('data-cms-page');
    if (!pageId) return;

    try {
        const d = await getDoc(doc(db, "settings", "page_content"));
        if (!d.exists()) return;
        const content = d.data();

        // Find all CMS slots on this page
        const slots = document.querySelectorAll('[data-cms-slot]');
        slots.forEach(el => {
            const slotId = el.getAttribute('data-cms-slot');
            const slotType = el.getAttribute('data-cms-type') || 'image';
            const key = `${pageId}__${slotId}`;
            const value = content[key];

            if (!value) return; // No content assigned, keep placeholder

            if (slotType === 'image') {
                // Replace placeholder with actual image
                const url = typeof value === 'string' ? value : value.url;
                if (!url) return;

                el.innerHTML = `<img src="${url}" alt="${value.name || slotId}" style="width:100%;height:100%;object-fit:cover;">`;
                el.style.background = 'none';
                el.style.border = 'none';

            } else if (slotType === 'video') {
                // Parse YouTube/Twitch URL into embed
                const url = typeof value === 'string' ? value : value.url;
                if (!url) return;

                const embedUrl = getEmbedUrl(url);
                if (embedUrl) {
                    el.innerHTML = `<iframe src="${embedUrl}" frameborder="0" allowfullscreen allow="autoplay; encrypted-media" style="width:100%;height:100%;position:absolute;top:0;left:0;"></iframe>`;
                    el.style.position = 'relative';
                    el.style.paddingBottom = '56.25%'; // 16:9
                    el.style.height = '0';
                    el.style.overflow = 'hidden';
                    el.style.background = 'none';
                    el.style.border = 'none';
                    el.style.display = 'block';
                    el.style.alignItems = 'unset';
                    el.style.justifyContent = 'unset';
                } else {
                    // Direct video file URL
                    el.innerHTML = `<video src="${url}" controls style="width:100%;height:100%;object-fit:contain;"></video>`;
                    el.style.background = 'none';
                    el.style.border = 'none';
                }

            } else if (slotType === 'text') {
                const text = typeof value === 'string' ? value : (value.text || value.url || '');
                if (!text) return;
                el.textContent = text;
            }
        });

    } catch (err) {
        console.error('CMS load error:', err);
    }
})();

function getEmbedUrl(url) {
    // YouTube
    let match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;

    // YouTube Shorts
    match = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;

    // Twitch clips
    match = url.match(/clips\.twitch\.tv\/([a-zA-Z0-9_-]+)/);
    if (match) return `https://clips.twitch.tv/embed?clip=${match[1]}&parent=${window.location.hostname}`;

    // Twitch videos
    match = url.match(/twitch\.tv\/videos\/(\d+)/);
    if (match) return `https://player.twitch.tv/?video=${match[1]}&parent=${window.location.hostname}`;

    // Twitch channel
    match = url.match(/twitch\.tv\/([a-zA-Z0-9_]+)$/);
    if (match) return `https://player.twitch.tv/?channel=${match[1]}&parent=${window.location.hostname}`;

    // Already an embed URL
    if (url.includes('embed')) return url;

    return null;
}
