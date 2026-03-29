// ===== TACTICAL MENU TOGGLE =====

const logoMenu = document.getElementById('logoMenu');
const tacticalMenu = document.getElementById('tacticalMenu');
const menuClose = document.getElementById('menuClose');
const menuOverlay = document.getElementById('menuOverlay');

// ===== NAV HINT — hamburger on logo =====
// Fades out when menu opens, fades back in when menu closes. Always visible.
(function initNavHint() {

    const style = document.createElement('style');
    style.textContent = `
        .nav-hint-hamburger {
            font-size: 22px;
            color: var(--accent, #00D9FF);
            margin-right: 10px;
            pointer-events: none;
            user-select: none;
            vertical-align: middle;
            text-shadow: 0 0 8px var(--accent-glow, rgba(0,217,255,.5));
            line-height: 1;
            transition: opacity 0.3s ease;
        }
    `;
    document.head.appendChild(style);

    const hamburger = document.createElement('span');
    hamburger.className = 'nav-hint-hamburger';
    hamburger.setAttribute('aria-hidden', 'true');
    hamburger.innerHTML = '&#9776;';

    function attachHint() {
        const brand = document.getElementById('logoMenu');
        if (!brand || brand.querySelector('.nav-hint-hamburger')) return;
        brand.insertBefore(hamburger, brand.firstChild);
    }

    function hideHint() { hamburger.style.opacity = '0'; }
    function showHint() { hamburger.style.opacity = '1'; }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attachHint);
    } else {
        attachHint();
    }

    window._navHintHide = hideHint;
    window._navHintShow = showHint;
})();

// Open menu when clicking logo
logoMenu.addEventListener('click', (e) => {
    e.preventDefault();
    tacticalMenu.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (typeof window._navHintHide === 'function') window._navHintHide();
});

// Close menu when clicking X button
menuClose.addEventListener('click', () => {
    tacticalMenu.classList.remove('active');
    document.body.style.overflow = 'auto';
    if (typeof window._navHintShow === 'function') window._navHintShow();
});

// Close menu when clicking overlay
menuOverlay.addEventListener('click', () => {
    tacticalMenu.classList.remove('active');
    document.body.style.overflow = 'auto';
    if (typeof window._navHintShow === 'function') window._navHintShow();
});

// Close menu with ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && tacticalMenu.classList.contains('active')) {
        tacticalMenu.classList.remove('active');
        document.body.style.overflow = 'auto';
        if (typeof window._navHintShow === 'function') window._navHintShow();
    }
});

// ===== SUBMENU TOGGLE =====
const sectionTitles = document.querySelectorAll('.section-title[data-submenu]');

sectionTitles.forEach(title => {
    title.addEventListener('click', (e) => {
        e.preventDefault();
        const submenuId = title.getAttribute('data-submenu');
        const submenu = document.getElementById('submenu-' + submenuId);
        document.querySelectorAll('.submenu').forEach(menu => {
            if (menu !== submenu) menu.classList.remove('open');
        });
        document.querySelectorAll('.section-title').forEach(t => {
            if (t !== title) t.classList.remove('open');
        });
        submenu.classList.toggle('open');
        title.classList.toggle('open');
    });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});