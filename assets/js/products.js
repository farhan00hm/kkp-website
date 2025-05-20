// products.js

// Global variables
let allProducts = [];
let filteredProducts = [];
let currentCategory = 'all';
let searchQuery = '';

// Initialize products page
document.addEventListener('DOMContentLoaded', function() {
    // Load products after a short delay to ensure language system is initialized
    setTimeout(() => {
        loadProducts();
        setupEventListeners();
    }, 800);
});

// Load products from JSON file
function loadProducts() {
    fetch('assets/data/products.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            allProducts = data;
            filteredProducts = [...allProducts];
            displayProducts(filteredProducts);
            updateCategoryLabels();
        })
        .catch(error => {
            console.error('Error loading products:', error);
            document.getElementById('productsList').innerHTML = `
                <div class="col-12 text-center py-5">
                    <p class="text-danger">Failed to load products. Please try again later.</p>
                </div>
            `;
        });
}

// Set up event listeners
function setupEventListeners() {
    // Category filter buttons
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');

            // Filter products by category
            currentCategory = this.getAttribute('data-category');
            filterProducts();
        });
    });

    // Search input
    const searchInput = document.getElementById('productSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            searchQuery = this.value.trim().toLowerCase();
            filterProducts();
        });
    }

    // Search button
    const searchButton = document.getElementById('searchButton');
    if (searchButton) {
        searchButton.addEventListener('click', function() {
            searchQuery = document.getElementById('productSearch').value.trim().toLowerCase();
            filterProducts();
        });
    }
}

// Filter products based on category and search
function filterProducts() {
    filteredProducts = allProducts.filter(product => {
        // Check category
        const categoryMatch = currentCategory === 'all' || product.category === currentCategory;

        // Check search query
        let searchMatch = true;
        if (searchQuery !== '') {
            const currentLang = document.documentElement.lang || 'en';
            const nameField = currentLang === 'en' ? 'name_en' : 'name_bn';
            const descField = currentLang === 'en' ? 'description_en' : 'description_bn';

            searchMatch = product[nameField].toLowerCase().includes(searchQuery) ||
                         product[descField].toLowerCase().includes(searchQuery);
        }

        return categoryMatch && searchMatch;
    });

    displayProducts(filteredProducts);
}

// Display products
function displayProducts(products) {
    const productsList = document.getElementById('productsList');
    const currentLang = document.documentElement.lang || 'en';

    if (products.length === 0) {
        productsList.innerHTML = `
            <div class="col-12 text-center py-5">
                <p>${currentLang === 'en' ? 'No products found. Please try another search.' : 'কোন পণ্য পাওয়া যায়নি। অনুগ্রহ করে অন্য অনুসন্ধান চেষ্টা করুন।'}</p>
            </div>
        `;
        return;
    }

    let html = '';

    products.forEach(product => {
        const nameField = currentLang === 'en' ? 'name_en' : 'name_bn';
        const descField = currentLang === 'en' ? 'description_en' : 'description_bn';

        html += `
        <div class="col-md-4 col-lg-3 mb-4">
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-img">
                    <img src="${product.image}" alt="${product[nameField]}">
                </div>
                <div class="product-body">
                    <h5 class="product-title">${product[nameField]}</h5>
                    <div class="product-description">${product[descField]}</div>
                    <div class="product-price mb-3">
                        <div>
                            <div class="location" data-lang-key="products.cumilla">Cumilla</div>
                            <div class="price-tag">৳ ${product.cumillaPrice} per ${product.unit}</div>
                        </div>
                        <div>
                            <div class="location" data-lang-key="products.dhaka">Dhaka</div>
                            <div class="price-tag">৳ ${product.dhakaPrice} per ${product.unit}</div>
                        </div>
                    </div>
                    <button class="add-to-cart" data-lang-key="products.addToCart">Add to Cart</button>
                </div>
            </div>
        </div>
        `;
    });

    productsList.innerHTML = html;

    // Initialize add to cart buttons
    initAddToCartButtons();
}

// Update category labels
function updateCategoryLabels() {
    const currentLang = document.documentElement.lang || 'en';

    if (typeof LanguageManager !== 'undefined' && currentLang !== 'en') {
        // Update using language manager if available
        document.querySelectorAll('[data-lang-key]').forEach(element => {
            const key = element.getAttribute('data-lang-key');
            const text = LanguageManager.getTranslation(key);
            if (text) {
                if (element.tagName === 'INPUT') {
                    element.placeholder = text;
                } else {
                    element.textContent = text;
                }
            }
        });
    }
}

// Re-initialize add to cart buttons after displaying products
function initAddToCartButtons() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    if (addToCartButtons.length === 0) return;

    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            const productId = productCard.dataset.productId;
            const productName = productCard.querySelector('.product-title').textContent;
            const priceElements = productCard.querySelectorAll('.price-tag');

            // Get both Cumilla and Dhaka prices
            const cumillaPrice = priceElements[0].textContent;
            const dhakaPrice = priceElements[1] ? priceElements[1].textContent : cumillaPrice;

            // Add to cart logic is in main.js
            if (typeof addToCart === 'function') {
                addToCart(productId, productName, cumillaPrice, dhakaPrice);
            } else {
                console.error('addToCart function not found');

                // Fallback implementation
                let cart = JSON.parse(localStorage.getItem('kkpCart')) || [];

                // Check if product is already in cart
                const existingProductIndex = cart.findIndex(item => item.id === productId);

                if (existingProductIndex !== -1) {
                    // Update existing product
                    cart[existingProductIndex].quantity += 1;
                } else {
                    // Add new product
                    cart.push({
                        id: productId,
                        name: productName,
                        cumillaPrice: cumillaPrice,
                        dhakaPrice: dhakaPrice,
                        quantity: 1
                    });
                }

                // Save to localStorage
                localStorage.setItem('kkpCart', JSON.stringify(cart));

                // Show success message
                alert('Product added to cart!');

                // Update cart display if possible
                const cartButton = document.getElementById('cartButton');
                if (cartButton) {
                    const cartCount = cartButton.querySelector('.cart-count');
                    if (cartCount) {
                        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
                        cartCount.textContent = totalItems;
                        cartButton.style.display = 'flex';
                    }
                }
            }
        });
    });
}