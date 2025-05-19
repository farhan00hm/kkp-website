/**
 * KKP - Khundkar Khamar Prakalpa
 * Poultry page functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Load poultry products
    loadPoultryProducts();

    // Load bird varieties
    loadPoultryVarieties();

    // Initialize variety filters
    initVarietyFilters();
});

/**
 * Load poultry products from JSON file
 */
async function loadPoultryProducts() {
    try {
        const response = await fetch('data/products.json');
        const products = await response.json();

        // Filter to only poultry products
        const poultryProducts = products.filter(product => product.category === 'Poultry');

        // Get container element
        const productsContainer = document.querySelector('.poultry-products');

        // Exit if no container found
        if (!productsContainer) return;

        // Clear container and loading indicator
        productsContainer.innerHTML = '';

        // Check if there are poultry products
        if (poultryProducts.length === 0) {
            productsContainer.innerHTML = '<div class="alert alert-info">No poultry products are currently available. Please check back later or contact us directly.</div>';
            return;
        }

        // Create row for products
        const row = document.createElement('div');
        row.className = 'row';

        // Add products
        poultryProducts.forEach(product => {
            const col = document.createElement('div');
            col.className = 'col-lg-4 col-md-6 col-sm-12 mb-4';

            col.innerHTML = `
                <div class="product-card">
                    <div class="product-img" style="background-image: url('img/products/${product.image}')"></div>
                    <div class="product-details">
                        <h4 class="product-title">${product.name_en}</h4>
                        <p>${product.description_en}</p>
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
                            <i class="fas fa-shopping-cart"></i> Add to Cart
                        </button>
                    </div>
                </div>
            `;

            row.appendChild(col);
        });

        productsContainer.appendChild(row);

        // Re-add event listeners to new buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const productId = this.getAttribute('data-product-id');
                addToCart(productId);
            });
        });

    } catch (error) {
        console.error('Error loading poultry products:', error);
        const productsContainer = document.querySelector('.poultry-products');
        if (productsContainer) {
            productsContainer.innerHTML = `
                <div class="alert alert-danger">
                    Error loading products. Please try again later.
                </div>
            `;
        }
    }
}

/**
 * Load poultry varieties from JSON file
 */
async function loadPoultryVarieties() {
    try {
        const response = await fetch('data/poultry-varieties.json');
        const varieties = await response.json();

        // Get container element
        const varietiesContainer = document.querySelector('.varieties-container');

        // Exit if no container found
        if (!varietiesContainer) return;

        // Remove loading indicator
        const loadingIndicator = document.querySelector('.loading-varieties');
        if (loadingIndicator) {
            loadingIndicator.remove();
        }

        // Check if there are varieties
        if (varieties.length === 0) {
            varietiesContainer.innerHTML = '<div class="col-12"><div class="alert alert-info">No bird varieties are currently available. Please check back later.</div></div>';
            return;
        }

        // Add bird varieties
        varieties.forEach(bird => {
            const col = document.createElement('div');
            col.className = 'col-lg-4 col-md-6 col-sm-12 mb-4';
            col.setAttribute('data-category', bird.category.toLowerCase());

            // Create characteristics list
            const characteristicsList = bird.characteristics.map(char =>
            `<li><i class="fas fa-feather me-2" style="color: var(--gold);"></i>${char}</li>`
            ).join('');

            col.innerHTML = `
                <div class="card h-100">
                    <div class="position-absolute top-0 end-0 m-2">
                        <span class="badge ${getBadgeColor(bird.category)}">${bird.category}</span>
                    </div>
                    <img src="img/poultry/varieties/${bird.image}" alt="${bird.name_en}" class="card-img-top" style="height: 250px; object-fit: cover;">
                    <div class="card-body">
                        <h5 class="card-title">${bird.name_en}</h5>
                        <p class="card-text">${bird.description_en}</p>
                        <h6 class="mt-3">Key Characteristics:</h6>
                        <ul class="list-unstyled">
                            ${characteristicsList}
                        </ul>
                    </div>
                </div>
            `;

            varietiesContainer.appendChild(col);
        });

    } catch (error) {
        console.error('Error loading poultry varieties:', error);
        const varietiesContainer = document.querySelector('.varieties-container');
        if (varietiesContainer) {
            varietiesContainer.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger">
                        Error loading bird varieties. Please try again later.
                    </div>
                </div>
            `;
        }
    }
}

/**
 * Return appropriate badge color based on bird category
 * @param {string} category - Bird category
 * @returns {string} - Bootstrap badge class
 */
function getBadgeColor(category) {
    switch(category.toLowerCase()) {
        case 'chicken':
            return 'bg-primary';
        case 'duck':
            return 'bg-success';
        case 'goose':
            return 'bg-warning text-dark';
        default:
            return 'bg-secondary';
    }
}

/**
 * Initialize poultry variety filter buttons
 */
function initVarietyFilters() {
    document.querySelectorAll('[data-filter]').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();

            // Update active button
            document.querySelectorAll('[data-filter]').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');

            // Get filter value
            const filter = this.getAttribute('data-filter');

            // Apply filter
            const varieties = document.querySelectorAll('.varieties-container > div');
            varieties.forEach(variety => {
                if (filter === 'all') {
                    variety.style.display = '';
                } else {
                    const category = variety.getAttribute('data-category');
                    variety.style.display = (category === filter) ? '' : 'none';
                }
            });
        });
    });
}