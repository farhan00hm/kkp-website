// template-loader.js

document.addEventListener('DOMContentLoaded', function() {
    // Load header
    fetch('templates/header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header-placeholder').innerHTML = data;

            // Initialize language system after header is loaded
            if (typeof LanguageManager !== 'undefined') {
                LanguageManager.init();
            }

            // Highlight current page in navigation
            highlightCurrentPage();
        })
        .catch(error => console.error('Error loading header:', error));

    // Load footer
    fetch('templates/footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer-placeholder').innerHTML = data;
        })
        .catch(error => console.error('Error loading footer:', error));
});

// Function to highlight current page in navigation
function highlightCurrentPage() {
    const currentPage = window.location.pathname.split('/').pop();

    // Get all nav links
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}