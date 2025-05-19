
/**
 * KKP - Khundkar Khamar Prakalpa
 * Cattle page functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Load cattle products
    loadCattleProducts();

    // Load our calves
    loadCalves();

    // Load Qurbani cattle
    loadQurbaniCattle();

    // Initialize the calf filters
    initCalfFilters();

    // Initialize Qurbani cattle sort and compare
    initQurbaniControls();
});

/**
 * Load cattle products from JSON file
 */
async function loadCattleProducts() {
    try {
        const response = await fetch('data/products.json');
        const products = await response.json();

        // Filter to only cattle products
        const cattleProducts = products.filter(product => product.category === 'Cattle');

        // Get container element
        const productsContainer = document.querySelector('.cattle-products');

        // Exit if no container found
        if (!productsContainer) return;

        // Clear container and loading indicator
        productsContainer.innerHTML = '';

        // Check if there are cattle products
        if (cattleProducts.length === 0) {
            productsContainer.innerHTML = '<div class="alert alert-info">No cattle products are currently available. Please check back later or contact us directly.</div>';
            return;
        }

        // Create row for products
        const row = document.createElement('div');
        row.className = 'row';

        // Add products
        cattleProducts.forEach(product => {
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
        console.error('Error loading cattle products:', error);
        const productsContainer = document.querySelector('.cattle-products');
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
 * Load our calves from JSON file
 */
async function loadCalves() {
    try {
        const response = await fetch('data/calves.json');
        const calves = await response.json();

        // Get container element
        const calvesContainer = document.querySelector('.calves-container');

        // Exit if no container found
        if (!calvesContainer) return;

        // Remove loading indicator
        const loadingIndicator = document.querySelector('.loading-calves');
        if (loadingIndicator) {
            loadingIndicator.remove();
        }

        // Check if there are calves
        if (calves.length === 0) {
            calvesContainer.innerHTML = '<div class="col-12"><div class="alert alert-info">No calves are currently available. Please check back later.</div></div>';
            return;
        }

        // Add calves
        calves.forEach(calf => {
            const col = document.createElement('div');
            col.className = 'col-lg-4 col-md-6 col-sm-12 mb-4';
            col.setAttribute('data-gender', calf.gender.toLowerCase());

            // Format date of birth
            const dob = new Date(calf.dob);
            const formattedDob = dob.toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

            // Calculate age
            const now = new Date();
            const ageInMs = now - dob;
            const ageInDays = Math.floor(ageInMs / (1000 * 60 * 60 * 24));
            let ageText;

            if (ageInDays < 30) {
                ageText = `${ageInDays} days old`;
            } else if (ageInDays < 365) {
                const ageInMonths = Math.floor(ageInDays / 30);
                ageText = `${ageInMonths} month${ageInMonths > 1 ? 's' : ''} old`;
            } else {
                const ageInYears = Math.floor(ageInDays / 365);
                const remainingMonths = Math.floor((ageInDays % 365) / 30);
                ageText = `${ageInYears} year${ageInYears > 1 ? 's' : ''}`;
                if (remainingMonths > 0) {
                    ageText += ` ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
                }
                ageText += ` old`;
            }

            col.innerHTML = `
                <div class="card h-100">
                    <div class="position-absolute top-0 end-0 m-2">
                        <span class="badge ${calf.gender.toLowerCase() === 'male' ? 'bg-primary' : 'bg-danger'}">${calf.gender}</span>
                    </div>
                    <img src="img/cattle/calves/${calf.image}" alt="${calf.name}" class="card-img-top" style="height: 250px; object-fit: cover;">
                    <div class="card-body">
                        <h5 class="card-title">${calf.name}</h5>
                        <p class="card-text">
                            <small class="text-muted">Born: ${formattedDob} (${ageText})</small>
                        </p>
                        ${calf.description ? `<p class="card-text">${calf.description}</p>` : ''}
                        ${calf.parentage ? `<p class="card-text"><small class="text-muted">Parentage: ${calf.parentage}</small></p>` : ''}
                    </div>
                </div>
            `;

            calvesContainer.appendChild(col);
        });

    } catch (error) {
        console.error('Error loading calves:', error);
        const calvesContainer = document.querySelector('.calves-container');
        if (calvesContainer) {
            calvesContainer.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger">
                        Error loading calves. Please try again later.
                    </div>
                </div>
            `;
        }
    }
}

/**
 * Initialize calf filter buttons
 */
function initCalfFilters() {
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
            const calves = document.querySelectorAll('.calves-container > div');
            calves.forEach(calf => {
                if (filter === 'all') {
                    calf.style.display = '';
                } else {
                    const gender = calf.getAttribute('data-gender');
                    calf.style.display = (gender === filter) ? '' : 'none';
                }
            });
        });
    });
}

/**
 * Load Qurbani cattle from JSON file
 */
async function loadQurbaniCattle() {
    try {
        const response = await fetch('data/qurbani.json');
        const qurbaniCattle = await response.json();

        // Get container element
        const qurbaniContainer = document.querySelector('.qurbani-container');

        // Exit if no container found
        if (!qurbaniContainer) return;

        // Remove loading indicator
        const loadingIndicator = document.querySelector('.loading-qurbani');
        if (loadingIndicator) {
            loadingIndicator.remove();
        }

        // Check if there are qurbani cattle
        if (qurbaniCattle.length === 0) {
            qurbaniContainer.innerHTML = '<div class="col-12"><div class="alert alert-info">No Qurbani cattle are currently available. Please check back later or contact us directly.</div></div>';
            return;
        }

        // Store cattle data globally for sorting
        window.qurbaniCattle = qurbaniCattle;
        window.selectedForCompare = [];

        // Add cattle to the container
        displayQurbaniCattle(qurbaniCattle);

    } catch (error) {
        console.error('Error loading Qurbani cattle:', error);
        const qurbaniContainer = document.querySelector('.qurbani-container');
        if (qurbaniContainer) {
            qurbaniContainer.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger">
                        Error loading Qurbani cattle. Please try again later.
                    </div>
                </div>
            `;
        }
    }
}

/**
 * Display Qurbani cattle in the container
 */
function displayQurbaniCattle(cattle) {
    const qurbaniContainer = document.querySelector('.qurbani-container');
    qurbaniContainer.innerHTML = '';

    cattle.forEach(animal => {
        const col = document.createElement('div');
        col.className = 'col-lg-4 col-md-6 col-sm-12 mb-4';

        // Format last weighed date
        const weighedDate = new Date(animal.weighed_date);
        const formattedWeighedDate = weighedDate.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        col.innerHTML = `
            <div class="card h-100">
                <div class="position-absolute top-0 end-0 m-2">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="compare-${animal.tag_number}" data-tag="${animal.tag_number}">
                        <label class="form-check-label" for="compare-${animal.tag_number}">Compare</label>
                    </div>
                </div>
                <img src="img/cattle/qurbani/${animal.image}" alt="Qurbani cattle ${animal.tag_number}" class="card-img-top" style="height: 250px; object-fit: cover;">
                <div class="card-body">
                    <h5 class="card-title">Tag #${animal.tag_number}</h5>
                    <div class="d-flex justify-content-between mb-2">
                        <span><strong>Type:</strong> ${animal.type}</span>
                        <span><strong>Age:</strong> ${animal.age}</span>
                    </div>
                    <p class="card-text">
                        <strong>Weight:</strong> ${animal.weight} kg
                        <small class="text-muted d-block">(Weighed on ${formattedWeighedDate})</small>
                    </p>
                    <p class="card-text">
                        <strong>Price:</strong> ৳ ${animal.price.toLocaleString()}
                    </p>
                    ${animal.notes ? `<p class="card-text"><small class="text-muted">${animal.notes}</small></p>` : ''}
                </div>
                <div class="card-footer">
                    <a href="contact.html?reserve=${animal.tag_number}" class="btn btn-primary w-100">Reserve Now</a>
                </div>
            </div>
        `;

        qurbaniContainer.appendChild(col);
    });

    // Add event listeners to compare checkboxes
    document.querySelectorAll('.form-check-input[data-tag]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const tagNumber = this.getAttribute('data-tag');

            if (this.checked) {
                // Add to compare list
                if (!window.selectedForCompare.includes(tagNumber)) {
                    window.selectedForCompare.push(tagNumber);
                }
            } else {
                // Remove from compare list
                const index = window.selectedForCompare.indexOf(tagNumber);
                if (index !== -1) {
                    window.selectedForCompare.splice(index, 1);
                }
            }

            // Update compare button
            const compareButton = document.getElementById('compareButton');
            const compareCount = document.getElementById('compareCount');

            compareCount.textContent = window.selectedForCompare.length;
            compareButton.disabled = window.selectedForCompare.length < 2;
        });
    });
}

/**
 * Initialize Qurbani cattle sorting and comparison
 */
function initQurbaniControls() {
    // Sort selector
    const sortSelect = document.getElementById('sortQurbani');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            if (!window.qurbaniCattle) return;

            const sortValue = this.value;
            let sortedCattle = [...window.qurbaniCattle];

            switch(sortValue) {
                case 'id':
                    sortedCattle.sort((a, b) => a.tag_number.localeCompare(b.tag_number));
                    break;
                case 'weight-asc':
                    sortedCattle.sort((a, b) => a.weight - b.weight);
                    break;
                case 'weight-desc':
                    sortedCattle.sort((a, b) => b.weight - a.weight);
                    break;
                case 'price-asc':
                    sortedCattle.sort((a, b) => a.price - b.price);
                    break;
                case 'price-desc':
                    sortedCattle.sort((a, b) => b.price - a.price);
                    break;
                default:
                    // Default sort by ID
                    sortedCattle.sort((a, b) => a.tag_number.localeCompare(b.tag_number));
            }

            displayQurbaniCattle(sortedCattle);

            // Restore checked state for compare checkboxes
            window.selectedForCompare.forEach(tagNumber => {
                const checkbox = document.querySelector(`.form-check-input[data-tag="${tagNumber}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
        });
    }

    // Compare button
    const compareButton = document.getElementById('compareButton');
    if (compareButton) {
        compareButton.addEventListener('click', function() {
            if (window.selectedForCompare.length < 2) {
                alert('Please select at least 2 cattle to compare');
                return;
            }

            // Populate compare modal
            populateCompareModal();

            // Show modal
            const compareModal = new bootstrap.Modal(document.getElementById('compareModal'));
            compareModal.show();
        });
    }
}

/**
 * Populate the compare modal with selected cattle
 */
function populateCompareModal() {
    if (!window.qurbaniCattle || !window.selectedForCompare) return;

    // Get the table headers and body rows
    const table = document.getElementById('compareTable');
    const thead = table.querySelector('thead tr');
    const tbody = table.querySelector('tbody');

    // Clear existing columns except the first one (feature column)
    const headerCells = thead.querySelectorAll('th');
    for (let i = headerCells.length - 1; i > 0; i--) {
        headerCells[i].remove();
    }

    // Reset tbody rows
    const tbodyRows = tbody.querySelectorAll('tr');
    tbodyRows.forEach(row => {
        // Keep only the first cell (feature name)
        const cells = row.querySelectorAll('td');
        cells.forEach(cell => cell.remove());
    });

    // Add columns for each selected animal
    window.selectedForCompare.forEach(tagNumber => {
        // Find the animal data
        const animal = window.qurbaniCattle.find(a => a.tag_number === tagNumber);
        if (!animal) return;

        // Add header
        const th = document.createElement('th');
        th.textContent = `Cattle #${animal.tag_number}`;
        thead.appendChild(th);

        // Format weighed date
        const weighedDate = new Date(animal.weighed_date);
        const formattedWeighedDate = weighedDate.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });

        // Add cells to each row
        const rows = tbody.querySelectorAll('tr');

        // Image row
        const imageCell = document.createElement('td');
        imageCell.innerHTML = `<img src="img/cattle/qurbani/${animal.image}" alt="Qurbani cattle ${animal.tag_number}" class="img-fluid" style="max-height: 150px;">`;
        rows[0].appendChild(imageCell);

        // Tag number row
        const tagCell = document.createElement('td');
        tagCell.textContent = animal.tag_number;
        rows[1].appendChild(tagCell);

        // Weight row
        const weightCell = document.createElement('td');
        weightCell.innerHTML = `${animal.weight} kg<br><small>(${formattedWeighedDate})</small>`;
        rows[2].appendChild(weightCell);

        // Type row
        const typeCell = document.createElement('td');
        typeCell.textContent = animal.type;
        rows[3].appendChild(typeCell);

        // Age row
        const ageCell = document.createElement('td');
        ageCell.textContent = animal.age;
        rows[4].appendChild(ageCell);

        // Price row
        const priceCell = document.createElement('td');
        priceCell.textContent = `৳ ${animal.price.toLocaleString()}`;
        rows[5].appendChild(priceCell);

        // Action row
        const actionCell = document.createElement('td');
        actionCell.innerHTML = `<a href="contact.html?reserve=${animal.tag_number}" class="btn btn-sm btn-primary">Reserve</a>`;
        rows[6].appendChild(actionCell);
    });
}