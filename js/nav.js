// ===== TACTICAL MENU TOGGLE =====

const logoMenu = document.getElementById('logoMenu');
const tacticalMenu = document.getElementById('tacticalMenu');
const menuClose = document.getElementById('menuClose');
const menuOverlay = document.getElementById('menuOverlay');

// Open menu when clicking logo
logoMenu.addEventListener('click', (e) => {
    e.preventDefault();
    tacticalMenu.classList.add('active');
    document.body.style.overflow = 'hidden';
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