// assets/js/navigation.js

document.addEventListener('DOMContentLoaded', function() {
    // Fix for mobile navigation collapse
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');

    if (navbarToggler && navbarCollapse) {
        // Add click event to navbar toggler
        navbarToggler.addEventListener('click', function() {
            navbarCollapse.classList.toggle('show');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInside = navbarToggler.contains(event.target) ||
                                navbarCollapse.contains(event.target);

            if (!isClickInside && navbarCollapse.classList.contains('show')) {
                navbarCollapse.classList.remove('show');
            }
        });

        // Close menu when clicking on nav links
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                // Only on mobile view
                if (window.innerWidth < 992) {
                    // Don't close if it's a dropdown toggle
                    if (!this.classList.contains('dropdown-toggle')) {
                        navbarCollapse.classList.remove('show');
                    }
                }
            });
        });

        // Handle dropdown toggle properly on mobile
        const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
        dropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', function(e) {
                // Only on mobile view
                if (window.innerWidth < 992) {
                    e.preventDefault();
                    e.stopPropagation();

                    // Find the dropdown menu
                    const dropdownMenu = this.nextElementSibling;
                    if (dropdownMenu && dropdownMenu.classList.contains('dropdown-menu')) {
                        dropdownMenu.classList.toggle('show');
                    }
                }
            });
        });
    }
});