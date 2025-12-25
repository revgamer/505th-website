// ===== TACTICAL MENU TOGGLE =====

const logoMenu = document.getElementById('logoMenu');
const tacticalMenu = document.getElementById('tacticalMenu');
const menuClose = document.getElementById('menuClose');
const menuOverlay = document.getElementById('menuOverlay');

// Open menu when clicking logo
logoMenu.addEventListener('click', (e) => {
    e.preventDefault();
    tacticalMenu.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
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