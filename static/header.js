document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.getElementById('navToggle');
    const headerNav = document.getElementById('headerNav');

    if (navToggle && headerNav) {
        navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            headerNav.classList.toggle('open');

            // Animate hamburger icon
            const spans = navToggle.querySelectorAll('span');
            // We can add a class to navToggle to handle CSS animations if needed
            navToggle.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (headerNav.classList.contains('open') && !headerNav.contains(e.target) && !navToggle.contains(e.target)) {
                headerNav.classList.remove('open');
                navToggle.classList.remove('active');
            }
        });

        // Close menu when clicking a link
        headerNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                headerNav.classList.remove('open');
                navToggle.classList.remove('active');
            });
        });
    }
});
