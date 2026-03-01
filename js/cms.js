// ===== 505th CMS - Content Management System =====
// Handles: page content slots, Discord link sync, dynamic media pages

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getFirestore, doc, getDoc, getDocs, collection, query, orderBy } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

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

(async function initCMS() {
    try {
        const settingsDoc = await getDoc(doc(db, "settings", "site"));
        const settings = settingsDoc.exists() ? settingsDoc.data() : {};

        // 1. Replace ALL Discord links on the page
        if (settings.discord_invite) {
            document.querySelectorAll('a[href*="discord.gg"], a[href*="discord.com/invite"]').forEach(link => {
                link.href = settings.discord_invite;
            });
        }

        // 2. Page content slots
        const pageId = document.body.getAttribute('data-cms-page');
        if (pageId) {
            const contentDoc = await getDoc(doc(db, "settings", "page_content"));
            if (contentDoc.exists()) applyCmsSlots(contentDoc.data(), pageId);
        }

        // 3. Dynamic media pages
        const mediaType = document.body.getAttribute('data-cms-media');
        if (mediaType) await loadDynamicMedia(mediaType);

    } catch (err) {
        console.error('CMS error:', err);
    }
})();

function applyCmsSlots(content, pageId) {
    document.querySelectorAll('[data-cms-slot]').forEach(el => {
        const slotId = el.getAttribute('data-cms-slot');
        const slotType = el.getAttribute('data-cms-type') || 'image';
        const key = pageId + '__' + slotId;
        const value = content[key];
        if (!value) return;

        if (slotType === 'image') {
            const url = typeof value === 'string' ? value : value.url;
            if (!url) return;
            el.innerHTML = '<img src="' + url + '" alt="' + (value.name || slotId) + '" style="width:100%;height:100%;object-fit:cover;">';
            el.style.background = 'none';
            el.style.border = 'none';

        } else if (slotType === 'video') {
            const url = typeof value === 'string' ? value : value.url;
            if (!url) return;
            const embedUrl = getEmbedUrl(url);
            if (embedUrl) {
                el.innerHTML = '<iframe src="' + embedUrl + '" frameborder="0" allowfullscreen allow="autoplay; encrypted-media" style="width:100%;height:100%;position:absolute;top:0;left:0;"></iframe>';
                el.style.position = 'relative';
                el.style.paddingBottom = '56.25%';
                el.style.height = '0';
                el.style.overflow = 'hidden';
                el.style.background = 'none';
                el.style.border = 'none';
                el.style.display = 'block';
            } else {
                el.innerHTML = '<video src="' + url + '" controls style="width:100%;height:100%;object-fit:contain;"></video>';
                el.style.background = 'none';
                el.style.border = 'none';
            }

        } else if (slotType === 'text') {
            const text = typeof value === 'string' ? value : (value.text || value.url || '');
            if (text) el.textContent = text;
        }
    });
}

async function loadDynamicMedia(mediaType) {
    const container = document.getElementById('dynamicMediaGrid');
    if (!container) return;

    try {
        const snapshot = await getDocs(query(collection(db, "media"), orderBy("uploadedAt", "desc")));
        const items = [];
        snapshot.forEach(function(d) {
            const data = d.data();
            if (mediaType === 'all' || data.type === mediaType) items.push(data);
        });

        if (!items.length) {
            container.innerHTML = '<div class="no-media-msg">NO MEDIA AVAILABLE YET</div>';
            return;
        }

        let html = '';
        items.forEach(function(m) {
            if (mediaType === 'image') {
                html += '<div class="dyn-gallery-item">' +
                    '<div class="dyn-gallery-img">' +
                    '<img src="' + m.url + '" alt="' + esc(m.name) + '" loading="lazy">' +
                    '</div>' +
                    '<div class="dyn-gallery-info">' +
                    '<div class="dyn-gallery-name">' + esc(m.name) + '</div>' +
                    (m.description ? '<div class="dyn-gallery-desc">' + esc(m.description) + '</div>' : '') +
                    '<div class="dyn-gallery-meta">' + (m.category || '').toUpperCase() + ' &bull; ' + esc(m.uploadedBy || '') + '</div>' +
                    '</div></div>';
            } else if (mediaType === 'video') {
                var embed = getEmbedUrl(m.url);
                html += '<div class="dyn-video-item">' +
                    '<div class="dyn-video-embed">' +
                    (embed ? '<iframe src="' + embed + '" frameborder="0" allowfullscreen></iframe>' : '<video src="' + m.url + '" controls></video>') +
                    '</div>' +
                    '<div class="dyn-gallery-info">' +
                    '<div class="dyn-gallery-name">' + esc(m.name) + '</div>' +
                    (m.description ? '<div class="dyn-gallery-desc">' + esc(m.description) + '</div>' : '') +
                    '<div class="dyn-gallery-meta">' + (m.category || '').toUpperCase() + ' &bull; ' + esc(m.uploadedBy || '') + '</div>' +
                    '</div></div>';
            }
        });
        container.innerHTML = html;

        var countEl = document.getElementById('mediaItemCount');
        if (countEl) countEl.textContent = items.length;

    } catch (err) {
        console.error('Dynamic media error:', err);
        container.innerHTML = '<div class="no-media-msg">FAILED TO LOAD MEDIA</div>';
    }
}

function getEmbedUrl(url) {
    if (!url) return null;
    var m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (m) return 'https://www.youtube.com/embed/' + m[1];
    m = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (m) return 'https://www.youtube.com/embed/' + m[1];
    m = url.match(/clips\.twitch\.tv\/([a-zA-Z0-9_-]+)/);
    if (m) return 'https://clips.twitch.tv/embed?clip=' + m[1] + '&parent=' + window.location.hostname;
    m = url.match(/twitch\.tv\/videos\/(\d+)/);
    if (m) return 'https://player.twitch.tv/?video=' + m[1] + '&parent=' + window.location.hostname;
    m = url.match(/twitch\.tv\/([a-zA-Z0-9_]+)$/);
    if (m) return 'https://player.twitch.tv/?channel=' + m[1] + '&parent=' + window.location.hostname;
    if (url.includes('embed')) return url;
    return null;
}

function esc(t) {
    var d = document.createElement('div');
    d.textContent = t || '';
    return d.innerHTML;
}
