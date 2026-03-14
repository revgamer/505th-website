// ===== 505th Firebase Auth State for Navbar =====
// Add this to any page that has the navbar

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCYWrWE8-xBJsvh228xzcg5VOD7dIn48fg",
    authDomain: "th-website-91533.firebaseapp.com",
    projectId: "th-website-91533",
    storageBucket: "th-website-91533.firebasestorage.app",
    messagingSenderId: "1046139150142",
    appId: "1:1046139150142:web:01f409ae4a38c4f79d966f"
};

// Pages that require login — key=filename, value='any'|role name
const ROLE_GATED_PAGES = {
    'resources-roster.html':       'any',    // any registered user
    'resources-roadmap.html':      'staff_nco', // staff_nco+
    'resources-field-lexicon.html':'public', // public
    'resources-keybinds.html':     'public', // public
};
const ROLE_ORDER = ['enlistee','marine','recruiter','nco','staff_nco','commander','developer'];
function roleAllowed(userRole, required) {
    if (required === 'any') return true;
    return ROLE_ORDER.indexOf(userRole) >= ROLE_ORDER.indexOf(required);
}
function checkRoleGate(userRole) {
    const page = window.location.pathname.split('/').pop() || '';
    const required = ROLE_GATED_PAGES[page];
    if (!required || required === 'public') return; // public page, no gate
    if (!userRole) {
        sessionStorage.setItem('loginReturnTo', window.location.href);
        window.location.href = 'login.html';
        return;
    }
    if (!roleAllowed(userRole, required)) {
        window.location.href = 'home.html';
    }
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Watch auth state and update navbar
onAuthStateChanged(auth, async (user) => {
    const authBtn = document.getElementById('navAuthBtn');
    const authBtnMenu = document.getElementById('menuAuthSection');

    if (!authBtn) return; // No auth button on this page

    if (user) {
        // User is logged in - get their profile
        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();

                // Check role gate for this page
                checkRoleGate(userData.role);

                // Update navbar button
                authBtn.innerHTML = `<span class="auth-callsign">${escapeHtml(userData.callsign)}</span>`;
                authBtn.classList.add('logged-in');
                authBtn.onclick = null; // Remove link behavior
                authBtn.href = '#';

                // Show dropdown on click
                authBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const dropdown = document.getElementById('authDropdown');
                    if (dropdown) dropdown.classList.toggle('active');
                });

                // Close dropdown on click outside
                document.addEventListener('click', (e) => {
                    const dropdown = document.getElementById('authDropdown');
                    if (dropdown && !authBtn.contains(e.target) && !dropdown.contains(e.target)) {
                        dropdown.classList.remove('active');
                    }
                });

                // Build dropdown
                let dropdownHTML = `
                    <div class="auth-dropdown" id="authDropdown">
                        <div class="auth-dropdown-header">
                            <div class="auth-dropdown-callsign">${escapeHtml(userData.callsign)}</div>
                            <div class="auth-dropdown-role">${userData.role.toUpperCase()}</div>
                        </div>`;

                // Admin/Commander gets admin panel link
                dropdownHTML += `
                        <a href="profile.html" class="auth-dropdown-item">
                            <span>&#9823;</span> MY PROFILE
                        </a>`;

                if (['commander','developer','staff_nco','nco','recruiter'].includes(userData.role)) {
                    dropdownHTML += `
                        <a href="boot.html" class="auth-dropdown-item">
                            <span>⚙</span> COMMAND PANEL
                        </a>`;
                }

                dropdownHTML += `
                        <button class="auth-dropdown-item logout-item" id="navLogoutBtn">
                            <span>⏻</span> LOGOUT
                        </button>
                    </div>`;

                // Insert dropdown after the button
                const existing = document.getElementById('authDropdown');
                if (existing) existing.remove();
                authBtn.insertAdjacentHTML('afterend', dropdownHTML);

                // Logout handler
                document.getElementById('navLogoutBtn').addEventListener('click', async () => {
                    await signOut(auth);
                    window.location.href = 'home.html';
                });

                // Update tactical menu auth section
                if (authBtnMenu) {
                    let menuHTML = `
                        <div class="menu-auth-info">
                            <span class="menu-auth-callsign">${escapeHtml(userData.callsign)}</span>
                            <span class="menu-auth-role">${userData.role.toUpperCase()}</span>
                        </div>`;

                    menuHTML += `
                        <a href="profile.html" class="submenu-item">
                            <span class="submenu-bullet">&#9655;</span>
                            My Profile
                        </a>`;

                    if (['commander','developer','staff_nco','nco','recruiter'].includes(userData.role)) {
                        menuHTML += `
                        <a href="boot.html" class="submenu-item">
                            <span class="submenu-bullet">&#9655;</span>
                            Command Panel
                        </a>`;
                    }

                    menuHTML += `
                        <a href="#" class="submenu-item menu-logout-link" id="menuLogoutBtn">
                            <span class="submenu-bullet">▸</span>
                            Logout
                        </a>`;

                    authBtnMenu.innerHTML = menuHTML;

                    // Menu logout handler
                    document.getElementById('menuLogoutBtn')?.addEventListener('click', async (e) => {
                        e.preventDefault();
                        await signOut(auth);
                        window.location.href = 'home.html';
                    });
                }
            }
        } catch (err) {
            console.error('Auth state error:', err);
        }
    } else {
        // Not logged in — check if this page requires login
        checkRoleGate(null);

        // Not logged in — show LOGIN button
        authBtn.innerHTML = 'LOGIN';
        authBtn.classList.remove('logged-in');
        authBtn.href = 'login.html';
        authBtn.onclick = null;

        // Remove dropdown if exists
        const existing = document.getElementById('authDropdown');
        if (existing) existing.remove();

        // Update tactical menu
        if (authBtnMenu) {
            authBtnMenu.innerHTML = `
                <a href="login.html" class="submenu-item">
                    <span class="submenu-bullet">▸</span>
                    System Login
                </a>`;
        }
    }
});

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}