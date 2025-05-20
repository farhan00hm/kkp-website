// main.js

// Document Ready Function
document.addEventListener('DOMContentLoaded', function() {
    // Initialize after templates are loaded
    setTimeout(() => {
        initNavbarDropdowns();
        initAddToCartButtons();
        setupContactLinks();
        initFormValidation();

        // Add our new cart display initialization
        initCartDisplay();

        // Add cart button to body if it doesn't exist
        ensureCartButtonExists();
    }, 500); // Small delay to ensure templates are loaded
});

// Initialize Bootstrap Dropdowns
function initNavbarDropdowns() {
    // Bootstrap dropdowns should be automatically initialized by Bootstrap JS
    // This function is for any additional dropdown functionality

    // Ensure mobile dropdown works correctly
    const dropdownToggle = document.querySelectorAll('.dropdown-toggle');
    dropdownToggle.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            // For touch devices, first click should open dropdown
            if (window.innerWidth < 992) {
                if (!this.classList.contains('show')) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.classList.add('show');
                    this.nextElementSibling.classList.add('show');
                }
            }
        });
    });
}

// Initialize Add to Cart Buttons
function initAddToCartButtons() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    if (addToCartButtons.length === 0) return; // No buttons found, exit

    const cartButton = document.getElementById('cartButton');
    if (!cartButton) {
        // If cart button doesn't exist yet, create it
        ensureCartButtonExists();
    }

    // Load cart from localStorage
    let cart = JSON.parse(localStorage.getItem('kkpCart')) || [];
    updateCartDisplay();

    // Add to cart click event
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            const productId = productCard.dataset.productId;
            const productName = productCard.querySelector('.product-title').textContent;
            const priceElements = productCard.querySelectorAll('.price-tag');

            // Get both Cumilla and Dhaka prices
            const cumillaPrice = priceElements[0].textContent;
            const dhakaPrice = priceElements[1] ? priceElements[1].textContent : cumillaPrice;

            // Use our enhanced addToCart function
            addToCart(productId, productName, cumillaPrice, dhakaPrice);
        });
    });

    // Cart button click event
    if (cartButton) {
        cartButton.addEventListener('click', function() {
            showCartModal();
        });
    }
}

// Setup Contact Links with tel: and mailto:
function setupContactLinks() {
    // Add tel: and mailto: links
    const phoneLinks = document.querySelectorAll('.phone-link');
    const emailLinks = document.querySelectorAll('.email-link');

    phoneLinks.forEach(link => {
        if (!link.href.startsWith('tel:')) {
            const phone = link.textContent.trim();
            link.href = `tel:${phone.replace(/[^0-9+]/g, '')}`;
        }
    });

    emailLinks.forEach(link => {
        if (!link.href.startsWith('mailto:')) {
            const email = link.textContent.trim();
            link.href = `mailto:${email}`;
        }
    });
}

// Initialize Form Validation
function initFormValidation() {
    const contactForm = document.querySelector('.contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Basic validation
        const name = document.getElementById('name');
        const email = document.getElementById('email');
        const subject = document.getElementById('subject');
        const message = document.getElementById('message');

        let isValid = true;

        if (!name.value.trim()) {
            markInvalid(name);
            isValid = false;
        } else {
            markValid(name);
        }

        if (!email.value.trim() || !isValidEmail(email.value)) {
            markInvalid(email);
            isValid = false;
        } else {
            markValid(email);
        }

        if (!subject.value.trim()) {
            markInvalid(subject);
            isValid = false;
        } else {
            markValid(subject);
        }

        if (!message.value.trim()) {
            markInvalid(message);
            isValid = false;
        } else {
            markValid(message);
        }

        if (isValid) {
            // Here you would typically submit the form data via AJAX
            // For now, we'll just show a success message
            showToast('Message sent successfully! We will contact you soon.');
            contactForm.reset();
        }
    });

    function markInvalid(element) {
        element.classList.add('is-invalid');
    }

    function markValid(element) {
        element.classList.remove('is-invalid');
        element.classList.add('is-valid');
    }

    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
}

// Function to show toast message
function showToast(message) {
    // Create toast element if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');

    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }

    // Create the toast
    const toastId = 'toast-' + Date.now();
    const toastHtml = `
    <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header">
            <strong class="me-auto">KKP</strong>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
            ${message}
        </div>
    </div>
    `;

    // Add toast to container
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);

    // Initialize and show the toast
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
    toast.show();

    // Remove the toast element after it's hidden
    toastElement.addEventListener('hidden.bs.toast', function() {
        toastElement.remove();
    });
}

// Initialize cart display
function initCartDisplay() {
    const cart = JSON.parse(localStorage.getItem('kkpCart')) || [];
    const cartButton = document.getElementById('cartButton');

    if (!cartButton) return;

    const cartCount = cartButton.querySelector('.badge');

    if (cart.length > 0) {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartButton.style.display = 'flex';
    } else {
        cartButton.style.display = 'none';
    }
}

// Enhanced addToCart function
function addToCart(productId, productName, cumillaPrice, dhakaPrice) {
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

    // Update cart display
    updateCartDisplay();

    // Show success message
    showToast('Product added to cart!');
}

// Update cart display
function updateCartDisplay() {
    const cart = JSON.parse(localStorage.getItem('kkpCart')) || [];
    const cartButton = document.getElementById('cartButton');

    if (!cartButton) return;

    const cartCount = cartButton.querySelector('.badge');

    if (cart.length > 0) {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;

        if (cartButton.style.display === 'none') {
            cartButton.style.display = 'flex';
        }
    } else {
        cartButton.style.display = 'none';
    }
}

function ensureCartButtonExists() {
    if (!document.getElementById('cartButton')) {
        const cartBtn = document.createElement('div');
        cartBtn.id = 'cartButton';
        cartBtn.className = 'cart-button';
        cartBtn.innerHTML = '<i class="fas fa-shopping-cart"></i><span class="badge">0</span>';
        document.body.appendChild(cartBtn);

        // Add click event
        cartBtn.addEventListener('click', function() {
            showCartModal();
        });
    }
}

function showCartModal() {
    // If no cart modal exists, create one
    let cartModal = document.getElementById('cartModal');

    if (!cartModal) {
        cartModal = document.createElement('div');
        cartModal.id = 'cartModal';
        cartModal.className = 'modal fade';
        cartModal.setAttribute('tabindex', '-1');
        cartModal.setAttribute('aria-hidden', 'true');

        document.body.appendChild(cartModal);
    }

    // Get current language
    const currentLang = document.documentElement.lang || 'en';

    // Load cart from localStorage
    const cart = JSON.parse(localStorage.getItem('kkpCart')) || [];

    // Check if empty
    const isEmpty = cart.length === 0;

    // Get translations
    const getTranslation = (key) => {
        return (typeof LanguageManager !== 'undefined' && LanguageManager.getTranslation)
            ? LanguageManager.getTranslation(key)
            : key;
    };

    // Translations
    const cartTitle = getTranslation('cart.title') || (currentLang === 'en' ? 'Your Cart' : 'আপনার কার্ট');
    const emptyCartText = getTranslation('cart.empty') || (currentLang === 'en' ? 'Your cart is empty' : 'আপনার কার্ট খালি');
    const productText = getTranslation('products.product') || (currentLang === 'en' ? 'Product' : 'পণ্য');
    const quantityText = getTranslation('cart.quantity') || (currentLang === 'en' ? 'Quantity' : 'পরিমাণ');
    const actionText = getTranslation('cart.action') || (currentLang === 'en' ? 'Action' : 'পদক্ষেপ');
    const whatsappOrderText = getTranslation('cart.whatsappOrder') || (currentLang === 'en' ? 'Order via WhatsApp' : 'WhatsApp এর মাধ্যমে অর্ডার করুন');
    const messengerOrderText = getTranslation('cart.messengerOrder') || (currentLang === 'en' ? 'Order via Messenger' : 'Messenger এর মাধ্যমে অর্ডার করুন');
    const clearCartText = getTranslation('cart.clearCart') || (currentLang === 'en' ? 'Clear Cart' : 'কার্ট পরিষ্কার করুন');

    // Generate cart content
    let cartContent = `
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">${cartTitle}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
    `;

    if (isEmpty) {
        cartContent += `
            <div class="text-center py-5">
                <i class="fas fa-shopping-cart fa-3x mb-3 text-muted"></i>
                <p>${emptyCartText}</p>
                <a href="products.html" class="btn btn-primary mt-3">
                    ${getTranslation('products.viewAll') || (currentLang === 'en' ? 'View Products' : 'পণ্য দেখুন')}
                </a>
            </div>
        `;
    } else {
        cartContent += `
        <div class="table-responsive">
            <table class="table align-middle">
                <thead>
                    <tr>
                        <th>${productText}</th>
                        <th class="text-center">${quantityText}</th>
                        <th class="text-end">${actionText}</th>
                    </tr>
                </thead>
                <tbody>
        `;

        // Add each cart item
        cart.forEach((item, index) => {
            cartContent += `
            <tr>
                <td>
                    <div class="d-flex flex-column">
                        <span class="fw-medium">${item.name}</span>
                        <small class="text-muted">
                            ${currentLang === 'en' ? 'Cumilla: ' : 'কুমিল্লা: '}${item.cumillaPrice}${currentLang === 'en' ? ', Dhaka: ' : ', ঢাকা: '}${item.dhakaPrice}
                        </small>
                    </div>
                </td>
                <td class="text-center">
                    <div class="input-group input-group-sm quantity-control">
                        <button class="btn btn-outline-secondary decrease-qty" data-index="${index}">-</button>
                        <input type="text" class="form-control text-center item-qty" value="${item.quantity}" readonly>
                        <button class="btn btn-outline-secondary increase-qty" data-index="${index}">+</button>
                    </div>
                </td>
                <td class="text-end">
                    <button class="btn btn-sm btn-danger remove-item" data-index="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
            `;
        });

        cartContent += `
                </tbody>
            </table>
        </div>
        `;
    }

    // Add action buttons
    cartContent += `
            </div>
            <div class="modal-footer ${isEmpty ? 'd-flex justify-content-center' : 'flex-column'}">
    `;

    if (!isEmpty) {
        cartContent += `
        <div class="w-100 mb-2">
            <button class="btn btn-success w-100" id="whatsappOrderBtn">
                <i class="fab fa-whatsapp me-2"></i>${whatsappOrderText}
            </button>
        </div>
        <div class="w-100">
            <button class="btn btn-primary w-100" id="messengerOrderBtn">
                <i class="fab fa-facebook-messenger me-2"></i>${messengerOrderText}
            </button>
        </div>
        <div class="w-100 mt-2">
            <button class="btn btn-outline-danger w-100" id="clearCartBtn">
                <i class="fas fa-trash me-2"></i>${clearCartText}
            </button>
        </div>
        `;
    }

    cartContent += `
            </div>
        </div>
    </div>
    `;

    // Set modal content
    cartModal.innerHTML = cartContent;

    // Create Bootstrap modal instance
    const modalInstance = new bootstrap.Modal(cartModal);
    modalInstance.show();

    // Add event listeners for cart actions
    if (!isEmpty) {
        // WhatsApp order button
        document.getElementById('whatsappOrderBtn').addEventListener('click', function() {
            createWhatsAppOrder();
            modalInstance.hide();
        });

        // Messenger order button
        document.getElementById('messengerOrderBtn').addEventListener('click', function() {
            createMessengerOrder();
            modalInstance.hide();
        });

        // Clear cart button
        document.getElementById('clearCartBtn').addEventListener('click', function() {
            clearCart();
            modalInstance.hide();
        });

        // Quantity adjustment buttons
        document.querySelectorAll('.increase-qty').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                cart[index].quantity += 1;
                updateCart();
                modalInstance.hide();
                showCartModal(); // Refresh modal
            });
        });

        document.querySelectorAll('.decrease-qty').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                if (cart[index].quantity > 1) {
                    cart[index].quantity -= 1;
                    updateCart();
                } else {
                    // Remove item if quantity becomes 0
                    cart.splice(index, 1);
                    updateCart();
                }
                modalInstance.hide();
                showCartModal(); // Refresh modal
            });
        });

        // Remove item buttons
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                cart.splice(index, 1);
                updateCart();
                modalInstance.hide();
                showCartModal(); // Refresh modal
            });
        });
    }
}

// Create WhatsApp order message
function createWhatsAppOrder() {
    const cart = JSON.parse(localStorage.getItem('kkpCart')) || [];
    if (cart.length === 0) return;

    // Get current language
    const currentLang = document.documentElement.lang || 'en';

    // Create order message
    let message = '';

    // Add header
    if (currentLang === 'en') {
        message += "Hello, I would like to place an order for:\n\n";
    } else {
        message += "হ্যালো, আমি একটি অর্ডার দিতে চাই:\n\n";
    }

    // Add items
    cart.forEach(item => {
        message += `${item.name} x${item.quantity}\n`;
    });

    // Add footer
    if (currentLang === 'en') {
        message += "\nPlease contact me to confirm the order.";
    } else {
        message += "\nঅর্ডার নিশ্চিত করতে আমার সাথে যোগাযোগ করুন।";
    }

    // Create WhatsApp link
    const whatsappLink = `https://wa.me/8801811936618?text=${encodeURIComponent(message)}`;

    // Open WhatsApp
    window.open(whatsappLink, '_blank');
}

// Create Messenger order
function createMessengerOrder() {
    // Open Messenger
    window.open('https://m.me/khundkar.khamar.prakalpa', '_blank');
}

// Clear all items from cart
function clearCart() {
    localStorage.setItem('kkpCart', JSON.stringify([]));
    updateCartDisplay();
}

// Update cart in localStorage and UI
function updateCart() {
    const cart = JSON.parse(localStorage.getItem('kkpCart')) || [];
    localStorage.setItem('kkpCart', JSON.stringify(cart));
    updateCartDisplay();
}