// ===== 505th Unit Card Embed =====
// Include on about pages: <script type="module" src="js/unit-cards-embed.js"></script>
// Add container: <div id="unitCardsEmbed" data-unit="Alpha Company"></div>

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey:"AIzaSyCYWrWE8-xBJsvh228xzcg5VOD7dIn48fg",
    authDomain:"th-website-91533.firebaseapp.com",
    projectId:"th-website-91533",
    storageBucket:"th-website-91533.firebasestorage.app",
    messagingSenderId:"1046139150142",
    appId:"1:1046139150142:web:01f409ae4a38c4f79d966f"
};
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

// Must match admin UNIT_CARD_STRUCTURE
const STRUCTURE = {
    'Alpha Company': {
        accent:'#8aad44',
        sections:{
            '1st Platoon — Killjoy': ['Platoon Commander','Platoon Sergeant','Platoon JTAC',
                'KJ 1-1 SQL','KJ 1-1 Marine 1','KJ 1-1 Marine 2','KJ 1-1 Marine 3','KJ 1-1 Marine 4','KJ 1-1 Marine 5','KJ 1-1 Marine 6','KJ 1-1 Marine 7','KJ 1-1 Marine 8',
                'KJ 1-2 SQL','KJ 1-2 Marine 1','KJ 1-2 Marine 2','KJ 1-2 Marine 3','KJ 1-2 Marine 4','KJ 1-2 Marine 5','KJ 1-2 Marine 6','KJ 1-2 Marine 7','KJ 1-2 Marine 8',
                'KJ 1-3 SQL','KJ 1-3 Marine 1','KJ 1-3 Marine 2','KJ 1-3 Marine 3','KJ 1-3 Marine 4','KJ 1-3 Marine 5','KJ 1-3 Marine 6','KJ 1-3 Marine 7','KJ 1-3 Marine 8'],
            '2nd Platoon': ['Platoon Commander','Platoon Sergeant','Platoon JTAC',
                'Alpha 2-1 SQL','Alpha 2-1 Marine 1','Alpha 2-1 Marine 2','Alpha 2-1 Marine 3','Alpha 2-1 Marine 4','Alpha 2-1 Marine 5','Alpha 2-1 Marine 6','Alpha 2-1 Marine 7','Alpha 2-1 Marine 8',
                'Bravo 2-2 SQL','Bravo 2-2 Marine 1','Bravo 2-2 Marine 2','Bravo 2-2 Marine 3','Bravo 2-2 Marine 4','Bravo 2-2 Marine 5','Bravo 2-2 Marine 6','Bravo 2-2 Marine 7','Bravo 2-2 Marine 8',
                'Charlie 2-3 SQL','Charlie 2-3 Marine 1','Charlie 2-3 Marine 2','Charlie 2-3 Marine 3','Charlie 2-3 Marine 4','Charlie 2-3 Marine 5','Charlie 2-3 Marine 6','Charlie 2-3 Marine 7','Charlie 2-3 Marine 8'],
            '3rd Platoon': ['Platoon Commander','Platoon Sergeant','Platoon JTAC',
                'Alpha 3-1 SQL','Alpha 3-1 Marine 1','Alpha 3-1 Marine 2','Alpha 3-1 Marine 3','Alpha 3-1 Marine 4','Alpha 3-1 Marine 5','Alpha 3-1 Marine 6','Alpha 3-1 Marine 7','Alpha 3-1 Marine 8',
                'Bravo 3-2 SQL','Bravo 3-2 Marine 1','Bravo 3-2 Marine 2','Bravo 3-2 Marine 3','Bravo 3-2 Marine 4','Bravo 3-2 Marine 5','Bravo 3-2 Marine 6','Bravo 3-2 Marine 7','Bravo 3-2 Marine 8',
                'Charlie 3-3 SQL','Charlie 3-3 Marine 1','Charlie 3-3 Marine 2','Charlie 3-3 Marine 3','Charlie 3-3 Marine 4','Charlie 3-3 Marine 5','Charlie 3-3 Marine 6','Charlie 3-3 Marine 7','Charlie 3-3 Marine 8'],
        }
    },
    'JSOTF-23': {
        accent:'#a47de0',
        sections:{
            '1st Plt — Marine Recon': ['Platoon Commander','Platoon Sergeant','Platoon JTAC',
                'Stalker 1-0 SQL','Stalker 1-0 Marine 1','Stalker 1-0 Marine 2','Stalker 1-0 Marine 3','Stalker 1-0 Marine 4','Stalker 1-0 Marine 5','Stalker 1-0 Marine 6',
                'Stalker 2-0 SQL','Stalker 2-0 Marine 1','Stalker 2-0 Marine 2','Stalker 2-0 Marine 3','Stalker 2-0 Marine 4','Stalker 2-0 Marine 5','Stalker 2-0 Marine 6'],
            '2nd Plt — Marine Raiders': ['Platoon Commander','Platoon Sergeant','Platoon JTAC',
                'Bravo 1-0 SQL','Bravo 1-0 Marine 1','Bravo 1-0 Marine 2','Bravo 1-0 Marine 3','Bravo 1-0 Marine 4','Bravo 1-0 Marine 5','Bravo 1-0 Marine 6',
                'Bravo 2-0 SQL','Bravo 2-0 Marine 1','Bravo 2-0 Marine 2','Bravo 2-0 Marine 3','Bravo 2-0 Marine 4','Bravo 2-0 Marine 5','Bravo 2-0 Marine 6'],
            '3rd Plt — Special Tactics Sq': ['Platoon Commander','Platoon Sergeant','Platoon JTAC',
                'Charlie 1-0 SQL','Charlie 1-0 Marine 1','Charlie 1-0 Marine 2','Charlie 1-0 Marine 3','Charlie 1-0 Marine 4','Charlie 1-0 Marine 5','Charlie 1-0 Marine 6',
                'Charlie 2-0 SQL','Charlie 2-0 Marine 1','Charlie 2-0 Marine 2','Charlie 2-0 Marine 3','Charlie 2-0 Marine 4','Charlie 2-0 Marine 5','Charlie 2-0 Marine 6'],
            '4th Plt — Pararescue Sq': ['Platoon Commander','Platoon Sergeant','Platoon JTAC',
                'Delta 1-0 SQL','Delta 1-0 Marine 1','Delta 1-0 Marine 2','Delta 1-0 Marine 3','Delta 1-0 Marine 4','Delta 1-0 Marine 5','Delta 1-0 Marine 6',
                'Delta 2-0 SQL','Delta 2-0 Marine 1','Delta 2-0 Marine 2','Delta 2-0 Marine 3','Delta 2-0 Marine 4','Delta 2-0 Marine 5','Delta 2-0 Marine 6'],
        }
    },
    '54th Air Wing': {
        accent:'#00c4b7',
        sections:{
            'Wing Staff':      ['Wing Commander','Deputy Wing Commander'],
            'Alpha Squadron':  ['Squadron CO','Squadron XO','Pilot 1','Pilot 2','Pilot 3','Pilot 4'],
            'Bravo Squadron':  ['Squadron CO','Squadron XO','Pilot 1','Pilot 2','Pilot 3','Pilot 4'],
        }
    },
    'Support Company': {
        accent:'#e05a4a',
        sections:{
            'Hospital Corpsman': ['Hospital Overseer','Hospital Supervisor','Head of Training',
                'Corpsman 1','Corpsman 2','Corpsman 3','Corpsman 4','Corpsman 5','Corpsman 6'],
        }
    }
};

const SQUAD_PREFIXES = ['KJ','Alpha','Bravo','Charlie','Stalker','Delta'];
function getSquadGroup(slot) {
    for (const pfx of SQUAD_PREFIXES) {
        if (slot.startsWith(pfx)) return slot.split(' ').slice(0,2).join(' ');
    }
    return null;
}
function esc(s) { const d=document.createElement('div'); d.textContent=s||''; return d.innerHTML; }
function makeKey(unit, section, slot) { return `${unit}__${section}__${slot}`.split(' ').join('_'); }

async function loadUnitCards() {
    const container = document.getElementById('unitCardsEmbed');
    if (!container) return;

    const unitName = container.dataset.unit;
    const cfg = STRUCTURE[unitName];
    if (!cfg) { container.innerHTML = ''; return; }

    container.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--accent);font-size:11px;letter-spacing:3px;opacity:.5">LOADING UNIT ROSTER...</div>';

    let ucData = {};
    try {
        const snap = await getDoc(doc(db, 'settings', 'unit_cards'));
        if (snap.exists()) ucData = snap.data();
    } catch(e) { console.warn('Unit card data:', e.message); }

    let html = '';
    for (const [section, slots] of Object.entries(cfg.sections)) {
        // Separate staff from squads
        const staffSlots = [];
        const squadGroups = {};
        const squadOrder = [];

        for (const slot of slots) {
            const sq = getSquadGroup(slot);
            if (sq) {
                if (!squadGroups[sq]) { squadGroups[sq] = []; squadOrder.push(sq); }
                squadGroups[sq].push(slot);
            } else {
                staffSlots.push(slot);
            }
        }

        html += `<div class="uc-section">
            <div class="uc-section-title" style="color:${cfg.accent}">${section}</div>`;

        // Staff
        if (staffSlots.length) {
            html += '<div class="uc-grid">';
            for (const slot of staffSlots) {
                const key = makeKey(unitName, section, slot);
                const val = ucData[key] || {};
                const status = val.status || 'open';
                const name = val.name || '';
                html += renderSlot(slot, status, name, cfg.accent);
            }
            html += '</div>';
        }

        // Squads
        for (const sqName of squadOrder) {
            html += `<div class="uc-squad-block" style="border-left-color:${cfg.accent}40">
                <div class="uc-squad-label" style="color:${cfg.accent}">${sqName.toUpperCase()}</div>
                <div class="uc-grid">`;
            for (const slot of squadGroups[sqName]) {
                const key = makeKey(unitName, section, slot);
                const val = ucData[key] || {};
                html += renderSlot(slot, val.status||'open', val.name||'', cfg.accent);
            }
            html += '</div></div>';
        }

        html += '</div>';
    }

    container.innerHTML = html;
}

function renderSlot(slot, status, name, accent) {
    const statusColor = status==='closed' ? '#667' : status==='filled' ? '#6a8d33' : 'rgba(0,217,255,.4)';
    const statusText = status==='closed' ? 'CLOSED' : status==='filled' ? esc(name) : 'OPEN';
    const statusClass = status==='filled' ? 'uc-filled' : status==='closed' ? 'uc-closed' : 'uc-open';
    return `<div class="uc-slot" style="border-color:${statusColor}">
        <div class="uc-slot-name">${esc(slot)}</div>
        <div class="uc-slot-status ${statusClass}">${statusText}</div>
    </div>`;
}

loadUnitCards();