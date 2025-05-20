// Improved template-loader.js

document.addEventListener('DOMContentLoaded', function() {
    // Load header with improved error handling and feedback
    loadHeader()
        .then(() => {
            // Initialize language system after header is loaded
            if (typeof LanguageManager !== 'undefined') {
                LanguageManager.init();
            }

            // Highlight current page in navigation
            highlightCurrentPage();

            // Initialize navigation dropdown behavior for mobile
            initMobileNavigation();
        })
        .catch(error => {
            console.error('Error loading header:', error);
            // Provide fallback for users
            const headerPlaceholder = document.getElementById('header-placeholder');
            if (headerPlaceholder) {
                headerPlaceholder.innerHTML = `
                    <div class="alert alert-warning">
                        <div class="container">
                            <p>Navigation could not be loaded. <a href="index.html">Return to home</a></p>
                        </div>
                    </div>
                `;
            }
        });

    // Load footer with improved error handling
    loadFooter()
        .catch(error => {
            console.error('Error loading footer:', error);
            // Provide fallback for users
            const footerPlaceholder = document.getElementById('footer-placeholder');
            if (footerPlaceholder) {
                footerPlaceholder.innerHTML = `
                    <div class="container py-4 text-center">
                        <p>&copy; 2025 KKP - Khundkar Khamar Prakalpa. All Rights Reserved.</p>
                    </div>
                `;
            }
        });
});

// Function to load header with Promise for better chaining
function loadHeader() {
    return new Promise((resolve, reject) => {
        const headerPlaceholder = document.getElementById('header-placeholder');
        if (!headerPlaceholder) {
            reject('Header placeholder not found');
            return;
        }

        fetch('templates/header.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load header template');
                }
                return response.text();
            })
            .then(data => {
                headerPlaceholder.innerHTML = data;
                resolve();
            })
            .catch(reject);
    });
}

// Function to load footer with Promise
function loadFooter() {
    return new Promise((resolve, reject) => {
        const footerPlaceholder = document.getElementById('footer-placeholder');
        if (!footerPlaceholder) {
            reject('Footer placeholder not found');
            return;
        }

        fetch('templates/footer.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load footer template');
                }
                return response.text();
            })
            .then(data => {
                footerPlaceholder.innerHTML = data;
                resolve();
            })
            .catch(reject);
    });
}

// Function to highlight current page in navigation
function highlightCurrentPage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // Get all nav links
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');

        // Check for exact match or index.html special case
        if (href === currentPage ||
            (currentPage === 'index.html' && href === 'index.html') ||
            (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');

            // If this is in a dropdown, highlight parent too
            const dropdownParent = link.closest('.dropdown');
            if (dropdownParent) {
                const parentLink = dropdownParent.querySelector('.dropdown-toggle');
                if (parentLink) {
                    parentLink.classList.add('active');
                }
            }
        } else {
            link.classList.remove('active');
        }
    });
}

// Function to initialize mobile navigation
function initMobileNavigation() {
    // Make dropdowns work properly on mobile
    const dropdownToggle = document.querySelectorAll('.dropdown-toggle');

    dropdownToggle.forEach(toggle => {
        // For mobile: first tap opens dropdown, second navigates
        toggle.addEventListener('click', function(e) {
            if (window.innerWidth < 992) {  // Bootstrap lg breakpoint
                if (!this.classList.contains('show') && !this.dataset.tapped) {
                    e.preventDefault();
                    e.stopPropagation();

                    // Close other open dropdowns
                    dropdownToggle.forEach(other => {
                        if (other !== this && other.classList.contains('show')) {
                            other.classList.remove('show');
                            other.nextElementSibling.classList.remove('show');
                            delete other.dataset.tapped;
                        }
                    });

                    // Mark as tapped once
                    this.dataset.tapped = 'true';

                    // Set timeout to reset tapped state
                    setTimeout(() => {
                        delete this.dataset.tapped;
                    }, 500);
                }
            }
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        const navbar = document.querySelector('.navbar-collapse');
        if (navbar && navbar.classList.contains('show')) {
            // Check if click is outside navbar
            if (!navbar.contains(e.target) &&
                !e.target.classList.contains('navbar-toggler')) {
                // Find the toggler and click it to close menu
                const toggler = document.querySelector('.navbar-toggler');
                if (toggler) {
                    toggler.click();
                }
            }
        }
    });
}