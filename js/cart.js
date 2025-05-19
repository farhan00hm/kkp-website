/**
 * KKP - Khundkar Khamar Prakalpa
 * Cart functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart from localStorage
    initCart();

    // Add event listeners to "Add to Cart" buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const productId = this.getAttribute('data-product-id');
            addToCart(productId);
        });
    });

    // Add event listener to cart FAB
    const cartFab = document.querySelector('.cart-fab');
    if (cartFab) {
        cartFab.addEventListener('click', openWhatsAppOrder);
    }
});

/**
 * Initialize cart and update UI
 */
function initCart() {
    // Get cart from localStorage or initialize empty
    const cart = JSON.parse(localStorage.getItem('kkp-cart')) || {};
    updateCartUI(cart);
}

/**
 * Add a product to cart
 * @param {string} productId - Product ID to add
 */
function addToCart(productId) {
    // Get current cart
    const cart = JSON.parse(localStorage.getItem('kkp-cart')) || {};

    // Add or increment product
    if (cart[productId]) {
        cart[productId]++;
    } else {
        cart[productId] = 1;
    }

    // Save updated cart
    localStorage.setItem('kkp-cart', JSON.stringify(cart));

    // Update cart UI
    updateCartUI(cart);

    // Show toast notification
    showToast('Product added to cart');
}

/**
 * Remove a product from cart
 * @param {string} productId - Product ID to remove
 */
function removeFromCart(productId) {
    // Get current cart
    const cart = JSON.parse(localStorage.getItem('kkp-cart')) || {};

    // Remove product if it exists
    if (cart[productId]) {
        delete cart[productId];

        // Save updated cart
        localStorage.setItem('kkp-cart', JSON.stringify(cart));

        // Update cart UI
        updateCartUI(cart);
    }
}

/**
 * Update cart quantity
 * @param {string} productId - Product ID to update
 * @param {number} quantity - New quantity
 */
function updateCartQuantity(productId, quantity) {
    // Get current cart
    const cart = JSON.parse(localStorage.getItem('kkp-cart')) || {};

    // Update quantity or remove if zero
    if (quantity > 0) {
        cart[productId] = quantity;
    } else {
        delete cart[productId];
    }

    // Save updated cart
    localStorage.setItem('kkp-cart', JSON.stringify(cart));

    // Update cart UI
    updateCartUI(cart);
}

/**
 * Update cart UI elements
 * @param {Object} cart - Cart object
 */
function updateCartUI(cart) {
    // Calculate total items
    const totalItems = Object.values(cart).reduce((total, qty) => total + qty, 0);

    // Update cart button visibility and count
    const cartFab = document.querySelector('.cart-fab');
    const cartCount = document.querySelector('.cart-fab .count');

    if (cartFab && cartCount) {
        if (totalItems > 0) {
            cartFab.classList.add('show');
            cartCount.textContent = totalItems;
        } else {
            cartFab.classList.remove('show');
        }
    }
}

/**
 * Generate WhatsApp order message and open WhatsApp
 */
async function openWhatsAppOrder() {
    const cart = JSON.parse(localStorage.getItem('kkp-cart')) || {};

    // Exit if cart is empty
    if (Object.keys(cart).length === 0) {
        return;
    }

    try {
        // Fetch product data
        const response = await fetch('data/products.json');
        const products = await response.json();

        // Build order message
        let message = "Hello! I'd like to place an order for:\n\n";

        // Get current language
        const currentLang = document.documentElement.lang || 'en';
        const nameField = currentLang === 'en' ? 'name_en' : 'name_bn';

        // Add products to message
        Object.entries(cart).forEach(([productId, quantity]) => {
            const product = products.find(p => p.id === productId);
            if (product) {
                message += `${quantity}x ${product[nameField]}\n`;
            }
        });

        message += "\nPlease contact me for delivery details. Thank you!";

        // Open WhatsApp with message
        const whatsappNumber = "8801811936618";
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');

    } catch (error) {
        console.error('Error generating order:', error);
        alert('There was an error creating your order. Please try again.');
    }
}

/**
 * Open Messenger for order
 */
function openMessengerOrder() {
    window.open('https://m.me/khundkar.khamar.prakalpa', '_blank');
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 */
function showToast(message) {
    // Create toast element if it doesn't exist
    let toast = document.getElementById('kkp-toast');

    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'kkp-toast';
        toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background-color: var(--dark-gray);
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      z-index: 1001;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
        document.body.appendChild(toast);
    }

    // Set message and show toast
    toast.textContent = message;
    toast.style.opacity = 1;

    // Hide toast after 3 seconds
    setTimeout(() => {
        toast.style.opacity = 0;
    }, 3000);
}