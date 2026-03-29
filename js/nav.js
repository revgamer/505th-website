// ===== TACTICAL MENU TOGGLE =====

const logoMenu = document.getElementById('logoMenu');
const tacticalMenu = document.getElementById('tacticalMenu');
const menuClose = document.getElementById('menuClose');
const menuOverlay = document.getElementById('menuOverlay');

// ===== NAV HINT — bouncing ▼ chevron on logo =====
// Shows until user opens the menu once per session, then permanently hides.
(function initNavHint() {
    const SESSION_KEY = 'navHintDismissed';
    if (sessionStorage.getItem(SESSION_KEY)) return;

    // Inject keyframe + hint styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes navHintBounce {
            0%, 100% { transform: translateY(0);  opacity: 1;   }
            45%       { transform: translateY(6px); opacity: 1;   }
            65%       { transform: translateY(2px); opacity: 0.7; }
        }
        @keyframes navHintFadeOut {
            from { opacity: 1; transform: translateY(0);  }
            to   { opacity: 0; transform: translateY(5px); }
        }
        .nav-hint-chevron {
            display: inline-flex;
            align-items: center;
            margin-left: 10px;
            color: var(--accent, #00D9FF);
            font-size: 12px;
            letter-spacing: 3px;
            animation: navHintBounce 1.5s ease-in-out infinite;
            animation-delay: 0.8s;
            pointer-events: none;
            user-select: none;
            vertical-align: middle;
            text-shadow: 0 0 8px var(--accent-glow, rgba(0,217,255,.5));
        }
        .nav-hint-chevron.nav-hint-out {
            animation: navHintFadeOut 0.3s ease forwards;
        }
        .nav-hint-label {
            font-family: 'Rajdhani', 'Share Tech Mono', monospace;
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 2px;
            color: rgba(0,217,255,.55);
            margin-left: 4px;
            pointer-events: none;
            user-select: none;
            vertical-align: middle;
        }
    `;
    document.head.appendChild(style);

    // Build hint element
    const hint = document.createElement('span');
    hint.className = 'nav-hint-chevron';
    hint.setAttribute('aria-hidden', 'true');
    hint.innerHTML = '▼';

    const label = document.createElement('span');
    label.className = 'nav-hint-label';
    label.textContent = 'MENU';

    function attachHint() {
        const brand = document.getElementById('logoMenu');
        if (!brand || brand.querySelector('.nav-hint-chevron')) return;
        brand.appendChild(hint);
        brand.appendChild(label);
    }

    function dismissHint() {
        sessionStorage.setItem(SESSION_KEY, '1');
        hint.classList.add('nav-hint-out');
        label.style.opacity = '0';
        label.style.transition = 'opacity 0.3s ease';
        hint.addEventListener('animationend', () => {
            hint.remove();
            label.remove();
        }, { once: true });
    }

    // Attach once DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attachHint);
    } else {
        attachHint();
    }

    // Dismiss when menu opens — hook into the click below
    window._navHintDismiss = dismissHint;
})();

// Open menu when clicking logo
logoMenu.addEventListener('click', (e) => {
    e.preventDefault();
    tacticalMenu.classList.add('active');
    document.body.style.overflow = 'hidden';
    // Dismiss nav hint on first menu open
    if (typeof window._navHintDismiss === 'function') {
        window._navHintDismiss();
        window._navHintDismiss = null;
    }
});

// Close menu when clicking X button
menuClose.addEventListener('click', () => {
    tacticalMenu.classList.remove('active');
    document.body.style.overflow = 'auto';
});

// Close menu when clicking overlay
menuOverlay.addEventListener('click', () => {
    tacticalMenu.classList.remove('active');
    document.body.style.overflow = 'auto';
});

// Close menu with ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && tacticalMenu.classList.contains('active')) {
        tacticalMenu.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// ===== SUBMENU TOGGLE =====
const sectionTitles = document.querySelectorAll('.section-title[data-submenu]');

sectionTitles.forEach(title => {
    title.addEventListener('click', (e) => {
        e.preventDefault();
        
        const submenuId = title.getAttribute('data-submenu');
        const submenu = document.getElementById('submenu-' + submenuId);
        
        // Close all other submenus
        document.querySelectorAll('.submenu').forEach(menu => {
            if (menu !== submenu) {
                menu.classList.remove('open');
            }
        });
        
        document.querySelectorAll('.section-title').forEach(t => {
            if (t !== title) {
                t.classList.remove('open');
            }
        });
        
        // Toggle current submenu
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
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});