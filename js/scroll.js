// ===== AUTO-HIDE NAVBAR ON SCROLL =====

let lastScrollTop = 0;
const navbar = document.getElementById('navbar');
const scrollThreshold = 100; // Only hide after scrolling 100px

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Only apply hiding if scrolled past threshold
    if (scrollTop > scrollThreshold) {
        if (scrollTop > lastScrollTop) {
            // Scrolling DOWN - hide navbar
            navbar.classList.add('hidden');
        } else {
            // Scrolling UP - show navbar
            navbar.classList.remove('hidden');
        }
    } else {
        // At top of page - always show navbar
        navbar.classList.remove('hidden');
    }
    
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
});