/**
 * KKP - Khundkar Khamar Prakalpa
 * Main JavaScript functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Initialize Bootstrap popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });

    // Load products if on products page
    if (document.querySelector('.products-container')) {
        loadProducts();
    }

    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80, // Account for fixed header
                    behavior: 'smooth'
                });
            }
        });
    });
});

/**
 * Load products from JSON file
 */
async function loadProducts() {
    try {
        const response = await fetch('data/products.json');
        const products = await response.json();

        // Get current language
        const currentLang = document.documentElement.lang || 'en';

        // Group products by category
        const categories = {};
        products.forEach(product => {
            if (!categories[product.category]) {
                categories[product.category] = [];
            }
            categories[product.category].push(product);
        });

        // Get container element
        const productsContainer = document.querySelector('.products-container');

        // Clear container
        productsContainer.innerHTML = '';

        // Add products by category
        Object.entries(categories).forEach(([category, categoryProducts]) => {
            // Add category title
            const categoryTitle = document.createElement('h2');
            categoryTitle.className = 'section-title';
            categoryTitle.textContent = category;
            productsContainer.appendChild(categoryTitle);

            // Create row for products
            const row = document.createElement('div');
            row.className = 'row';

            // Add products
            categoryProducts.forEach(product => {
                const nameField = currentLang === 'en' ? 'name_en' : 'name_bn';
                const descField = currentLang === 'en' ? 'description_en' : 'description_bn';

                const col = document.createElement('div');
                col.className = 'col-lg-4 col-md-6 col-sm-12 mb-4';

                col.innerHTML = `
          <div class="product-card">
            <div class="product-img" style="background-image: url('img/products/${product.image}')"></div>
            <div class="product-details">
              <h4 class="product-title">${product[nameField]}</h4>
              <p>${product[descField]}</p>
              <div class="product-price">
                <div class="row">
                  <div class="col-6">
                    <small class="product-location">Cumilla</small>
                    <div>৳ ${product.cumillaPrice} ${product.unit}</div>
                  </div>
                  <div class="col-6">
                    <small class="product-location">Dhaka</small>
                    <div>৳ ${product.dhakaPrice} ${product.unit}</div>
                  </div>
                </div>
              </div>
              <button class="btn btn-primary add-to-cart" data-product-id="${product.id}">
                <i class="fas fa-shopping-cart"></i> ${currentLang === 'en' ? 'Add to Cart' : 'কার্টে যোগ করুন'}
              </button>
            </div>
          </div>
        `;

                row.appendChild(col);
            });

            productsContainer.appendChild(row);
        });

        // Re-add event listeners to new buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const productId = this.getAttribute('data-product-id');
                addToCart(productId);
            });
        });

    } catch (error) {
        console.error('Error loading products:', error);
        const productsContainer = document.querySelector('.products-container');
        productsContainer.innerHTML = `
      <div class="alert alert-danger">
        Error loading products. Please try again later.
      </div>
    `;
    }
}