// ===== 505th Firebase Auth State for Navbar =====
// Add this to any page that has the navbar

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
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

const app = initializeApp(firebaseConfig);
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
                if (userData.role === 'commander' || userData.role === 'admin' || userData.role === 'developer') {
                    dropdownHTML += `
                        <a href="admin.html" class="auth-dropdown-item">
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
                    window.location.href = 'login.html';
                });

                // Update tactical menu auth section
                if (authBtnMenu) {
                    let menuHTML = `
                        <div class="menu-auth-info">
                            <span class="menu-auth-callsign">${escapeHtml(userData.callsign)}</span>
                            <span class="menu-auth-role">${userData.role.toUpperCase()}</span>
                        </div>`;

                    if (userData.role === 'commander' || userData.role === 'admin' || userData.role === 'developer') {
                        menuHTML += `
                        <a href="admin.html" class="submenu-item">
                            <span class="submenu-bullet">▸</span>
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
                        window.location.href = 'login.html';
                    });
                }
            }
        } catch (err) {
            console.error('Auth state error:', err);
        }
    } else {
        // Not logged in
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
