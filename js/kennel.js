/**
 * KKP - Khundkar Khamar Prakalpa
 * Kennel page functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Load our dogs
    loadDogs();

    // Load breeding program information
    loadBreedingProgram();

    // Load bond stories
    loadBondStories();

    // Initialize dog filters
    initDogFilters();

    // Initialize tabs
    initTabs();

    // Initialize puppy inquiry form
    initPuppyInquiryForm();
});

/**
 * Load dogs from JSON file
 */
async function loadDogs() {
    try {
        const response = await fetch('data/dogs.json');
        const dogs = await response.json();

        // Get container element
        const dogsContainer = document.querySelector('.dogs-container');

        // Exit if no container found
        if (!dogsContainer) return;

        // Remove loading indicator
        const loadingIndicator = document.querySelector('.loading-dogs');
        if (loadingIndicator) {
            loadingIndicator.remove();
        }

        // Check if there are dogs
        if (dogs.length === 0) {
            dogsContainer.innerHTML = '<div class="col-12"><div class="alert alert-info">No dogs are currently available to display. Please check back later.</div></div>';
            return;
        }

        // Add dogs to container
        dogs.forEach(dog => {
            const col = document.createElement('div');
            col.className = 'col-lg-4 col-md-6 col-sm-12 mb-4';
            col.setAttribute('data-breed', dog.breed.toLowerCase().replace(/\s+/g, '-'));
            col.setAttribute('data-gender', dog.sex.toLowerCase());
            col.setAttribute('data-role', dog.role.toLowerCase().split('&')[0].trim().replace(/\s+/g, '-'));

            // Format date of birth
            const dob = new Date(dog.dob);
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

            // Create carousel indicators
            const carouselIndicators = dog.images.map((img, index) =>
            `<button type="button" data-bs-target="#carousel-${dog.id}" data-bs-slide-to="${index}" ${index === 0 ? 'class="active" aria-current="true"' : ''} aria-label="Slide ${index + 1}"></button>`
            ).join('');

            // Create carousel items
            const carouselItems = dog.images.map((img, index) =>
            `<div class="carousel-item ${index === 0 ? 'active' : ''}">
                <img src="img/kennel/dogs/${img}" class="d-block w-100" alt="${dog.name}" style="height: 300px; object-fit: cover;">
            </div>`
            ).join('');

            // Create parentage text if available
            let parentageText = '';
            if (dog.parentage && (dog.parentage.sire !== "Unknown" || dog.parentage.dam !== "Unknown")) {
                parentageText = `
                    <div class="mt-2">
                        <strong>Parentage:</strong><br>
                        ${dog.parentage.sire !== "Unknown" ? `Sire: ${dog.parentage.sire}<br>` : ''}
                        ${dog.parentage.dam !== "Unknown" ? `Dam: ${dog.parentage.dam}` : ''}
                    </div>
                `;
            }

            // Create badge for "Born at KKP" dogs
            const kppBadge = dog.origin.includes('Born at KKP')
                ? '<span class="position-absolute top-0 start-0 m-2 badge bg-success">Born at KKP</span>'
                : '';

            col.innerHTML = `
                <div class="card h-100">
                    <div class="position-relative">
                        ${kppBadge}
                        <span class="position-absolute top-0 end-0 m-2 badge ${dog.sex === 'Male' ? 'bg-primary' : 'bg-danger'}">${dog.sex}</span>

                        <!-- Carousel -->
                        <div id="carousel-${dog.id}" class="carousel slide" data-bs-ride="carousel">
                            <div class="carousel-indicators">
                                ${carouselIndicators}
                            </div>
                            <div class="carousel-inner rounded-top">
                                ${carouselItems}
                            </div>
                            <button class="carousel-control-prev" type="button" data-bs-target="#carousel-${dog.id}" data-bs-slide="prev">
                                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                                <span class="visually-hidden">Previous</span>
                            </button>
                            <button class="carousel-control-next" type="button" data-bs-target="#carousel-${dog.id}" data-bs-slide="next">
                                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                                <span class="visually-hidden">Next</span>
                            </button>
                        </div>
                    </div>

                    <div class="card-body">
                        <h5 class="card-title">${dog.name}</h5>
                        <p class="card-text mb-1"><strong>Breed:</strong> ${dog.breed}</p>
                        <p class="card-text mb-1"><strong>Role:</strong> ${dog.role}</p>
                        <p class="card-text mb-1"><strong>Born:</strong> ${formattedDob} (${ageText})</p>
                        <p class="card-text mb-1"><strong>Origin:</strong> ${dog.origin}</p>
                        ${parentageText}

                        <div class="mt-3">
                            <p class="card-text"><strong>Personality:</strong> ${dog.personality}</p>
                        </div>

                        <button class="btn btn-outline-primary mt-2 w-100" type="button" data-bs-toggle="collapse" data-bs-target="#story-${dog.id}" aria-expanded="false" aria-controls="story-${dog.id}">
                            Read ${dog.name}'s Story
                        </button>

                        <div class="collapse mt-3" id="story-${dog.id}">
                            <div class="card card-body bg-light">
                                ${dog.story}
                            </div>
                        </div>
                    </div>
                </div>
            `;

            dogsContainer.appendChild(col);
        });

    } catch (error) {
        console.error('Error loading dogs:', error);
        const dogsContainer = document.querySelector('.dogs-container');
        if (dogsContainer) {
            dogsContainer.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger">
                        Error loading dogs. Please try again later.
                    </div>
                </div>
            `;
        }
    }
}

/**
 * Load breeding program information from JSON file
 */
async function loadBreedingProgram() {
    try {
        const response = await fetch('data/breeding-program.json');
        const breedingPrograms = await response.json();

        // Get container elements
        const activeContainer = document.querySelector('.active-litters-container');
        const upcomingContainer = document.querySelector('.upcoming-litters-container');
        const completedContainer = document.querySelector('.completed-litters-container');

        // Exit if no containers found
        if (!activeContainer && !upcomingContainer && !completedContainer) return;

        // Remove loading indicators
        document.querySelectorAll('.loading-breeding').forEach(el => el.remove());

        // Check if there are breeding programs
        if (breedingPrograms.length === 0) {
            const containers = [activeContainer, upcomingContainer, completedContainer].filter(c => c);
            containers.forEach(container => {
                container.innerHTML = '<div class="alert alert-info">No breeding information is currently available. Please check back later.</div>';
            });
            return;
        }

        // Filter by status
        const active = breedingPrograms.filter(program => program.status === 'Active');
        const upcoming = breedingPrograms.filter(program => program.status === 'Upcoming');
        const completed = breedingPrograms.filter(program => program.status === 'Completed');

        // Display active litters
        if (activeContainer) {
            if (active.length === 0) {
                activeContainer.innerHTML = '<div class="alert alert-info">No active litters at this time. Please check our upcoming litters.</div>';
            } else {
                activeContainer.innerHTML = '';
                active.forEach(program => displayBreedingProgram(program, activeContainer));
            }
        }

        // Display upcoming litters
        if (upcomingContainer) {
            if (upcoming.length === 0) {
                upcomingContainer.innerHTML = '<div class="alert alert-info">No upcoming litters planned at this time. Please check back later.</div>';
            } else {
                upcomingContainer.innerHTML = '';
                upcoming.forEach(program => displayBreedingProgram(program, upcomingContainer));
            }
        }

        // Display completed litters
        if (completedContainer) {
            if (completed.length === 0) {
                completedContainer.innerHTML = '<div class="alert alert-info">No previous litter information available. Please check back later.</div>';
            } else {
                completedContainer.innerHTML = '';
                completed.forEach(program => displayBreedingProgram(program, completedContainer));
            }
        }

    } catch (error) {
        console.error('Error loading breeding programs:', error);
        document.querySelectorAll('.breeding-container').forEach(container => {
            container.innerHTML = `
                <div class="alert alert-danger">
                    Error loading breeding information. Please try again later.
                </div>
            `;
        });
    }
}

/**
 * Display a breeding program in the specified container
 * @param {Object} program - Breeding program data
 * @param {Element} container - Container element
 */
function displayBreedingProgram(program, container) {
    const card = document.createElement('div');
    card.className = 'card mb-4';

    // Create appropriate header based on status
    let headerContent = '';
    if (program.status === 'Active') {
        const expectedDays = Math.round((new Date(program.expected_birth) - new Date()) / (1000 * 60 * 60 * 24));
        headerContent = `
            <h4>${program.sire.name} & ${program.dam.name}</h4>
            <p class="mb-0">Puppies expected on ${formatDate(program.expected_birth)} (Approximately ${expectedDays} days from now)</p>
        `;
    } else if (program.status === 'Upcoming') {
        headerContent = `
            <h4>${program.sire.name} & ${program.dam.name}</h4>
            <p class="mb-0">Mating planned for ${formatDate(program.mating_date)}</p>
        `;
    } else if (program.status === 'Completed') {
        headerContent = `
            <h4>${program.sire.name} & ${program.dam.name}</h4>
            <p class="mb-0">${program.puppies_born} puppies born on ${formatDate(program.birth_date)}</p>
        `;
    }

    // Create timeline for updates
    let timelineContent = '';
    if (program.updates && program.updates.length > 0) {
        const timelineItems = program.updates.map(update => `
            <li class="timeline-item mb-2">
                <span class="timeline-date">${formatDate(update.date)}</span>
                <p class="timeline-content">${update.note}</p>
            </li>
        `).join('');

        timelineContent = `
            <div class="mt-3">
                <h5>Updates</h5>
                <ul class="timeline">
                    ${timelineItems}
                </ul>
            </div>
        `;
    }

    // Create availability info based on status
    let availabilityContent = '';
    if (program.status === 'Active' || program.status === 'Upcoming') {
        availabilityContent = `
            <div class="mt-3">
                <h5>Availability</h5>
                <div class="row">
                    <div class="col-md-6">
                        <p><strong>Expected puppies:</strong> ${program.expected_puppies}</p>
                        <p><strong>Available for reservation:</strong> ${program.available_puppies}</p>
                        <p><strong>Already reserved:</strong> ${program.reserved_puppies}</p>
                    </div>
                    <div class="col-md-6">
                        <p><strong>Price per puppy:</strong> ৳ ${program.puppy_price.toLocaleString()}</p>
                        <p><strong>Expected colors:</strong> ${program.colors.join(', ')}</p>
                        <button class="btn btn-primary reserve-btn" data-breeding="${program.id}">Reserve a Puppy</button>
                    </div>
                </div>
            </div>
        `;
    } else if (program.status === 'Completed') {
        availabilityContent = `
            <div class="mt-3">
                <h5>Availability</h5>
                <p>${program.available_puppies > 0 ? `${program.available_puppies} puppies still available` : 'All puppies have been reserved'}</p>
                ${program.puppy_images ? createPuppyGallery(program) : ''}
            </div>
        `;
    }

    card.innerHTML = `
        <div class="card-header bg-light">
            ${headerContent}
        </div>
        <div class="card-body">
            <div class="row">
                <div class="col-md-6">
                    <p><strong>Sire:</strong> ${program.sire.name} (${program.sire.breed})</p>
                    <p><strong>Dam:</strong> ${program.dam.name} (${program.dam.breed})</p>
                </div>
                <div class="col-md-6">
                    <p>${program.description}</p>
                </div>
            </div>
            ${availabilityContent}
            ${timelineContent}
        </div>
    `;

    container.appendChild(card);

    // Add event listener to reservation buttons
    card.querySelectorAll('.reserve-btn').forEach(button => {
        button.addEventListener('click', function() {
            const breedingId = this.getAttribute('data-breeding');
            scrollToInquiryForm();
            populateInquiryForm(breedingId);
        });
    });
}

/**
 * Create a gallery for puppy images
 * @param {Object} program - Breeding program data
 * @returns {string} HTML for puppy gallery
 */
function createPuppyGallery(program) {
    if (!program.puppy_images || program.puppy_images.length === 0) return '';

    const carouselId = `carousel-litter-${program.id}`;

    // Create carousel indicators
    const indicators = program.puppy_images.map((img, index) =>
    `<button type="button" data-bs-target="#${carouselId}" data-bs-slide-to="${index}" ${index === 0 ? 'class="active" aria-current="true"' : ''} aria-label="Slide ${index + 1}"></button>`
    ).join('');

    // Create carousel items
    const items = program.puppy_images.map((img, index) =>
    `<div class="carousel-item ${index === 0 ? 'active' : ''}">
        <img src="img/kennel/litters/${img}" class="d-block w-100" alt="Litter ${program.id}" style="height: 300px; object-fit: cover;">
    </div>`
    ).join('');

    return `
        <div id="${carouselId}" class="carousel slide mt-3" data-bs-ride="carousel">
            <div class="carousel-indicators">
                ${indicators}
            </div>
            <div class="carousel-inner rounded">
                ${items}
            </div>
            <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Previous</span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Next</span>
            </button>
        </div>
    `;
}

/**
 * Load human-dog bond stories from JSON file
 */
async function loadBondStories() {
    try {
        const response = await fetch('data/bond-stories.json');
        const stories = await response.json();

        // Get container element
        const storiesContainer = document.querySelector('.bond-stories-container');

        // Exit if no container found
        if (!storiesContainer) return;

        // Remove loading indicator
        const loadingIndicator = document.querySelector('.loading-stories');
        if (loadingIndicator) {
            loadingIndicator.remove();
        }

        // Check if there are stories
        if (stories.length === 0) {
            storiesContainer.innerHTML = '<div class="alert alert-info">No bond stories are currently available. Please check back later.</div>';
            return;
        }

        // Create rows for stories (2 stories per row)
        for (let i = 0; i < stories.length; i += 2) {
            const row = document.createElement('div');
            row.className = 'row mb-4';

            // Add first story
            const story1 = stories[i];
            row.innerHTML = `
                <div class="col-md-6 mb-4 mb-md-0">
                    <div class="card h-100">
                        <img src="img/kennel/stories/${story1.image}" class="card-img-top" alt="${story1.title}" style="height: 250px; object-fit: cover;">
                        <div class="card-body">
                            <h5 class="card-title">${story1.title}</h5>
                            <p class="card-text mb-2"><strong>${story1.dog.name} & ${story1.human}</strong></p>
                            <p class="card-text">${story1.story}</p>
                        </div>
                    </div>
                </div>
            `;

            // Add second story if available
            if (i + 1 < stories.length) {
                const story2 = stories[i + 1];
                row.innerHTML += `
                    <div class="col-md-6">
                        <div class="card h-100">
                            <img src="img/kennel/stories/${story2.image}" class="card-img-top" alt="${story2.title}" style="height: 250px; object-fit: cover;">
                            <div class="card-body">
                                <h5 class="card-title">${story2.title}</h5>
                                <p class="card-text mb-2"><strong>${story2.dog.name} & ${story2.human}</strong></p>
                                <p class="card-text">${story2.story}</p>
                            </div>
                        </div>
                    </div>
                `;
            }

            storiesContainer.appendChild(row);
        }

    } catch (error) {
        console.error('Error loading bond stories:', error);
        const storiesContainer = document.querySelector('.bond-stories-container');
        if (storiesContainer) {
            storiesContainer.innerHTML = `
                <div class="alert alert-danger">
                    Error loading bond stories. Please try again later.
                </div>
            `;
        }
    }
}

/**
 * Initialize dog filter buttons
 */
function initDogFilters() {
    document.querySelectorAll('[data-dog-filter]').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();

            // Update active button
            document.querySelectorAll('[data-dog-filter]').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');

            // Get filter value and type
            const filterValue = this.getAttribute('data-filter-value');
            const filterType = this.getAttribute('data-dog-filter');

            // Apply filter
            const dogs = document.querySelectorAll('.dogs-container > div');
            dogs.forEach(dog => {
                if (filterValue === 'all') {
                    dog.style.display = '';
                } else {
                    const dogValue = dog.getAttribute(`data-${filterType}`);
                    dog.style.display = (dogValue === filterValue) ? '' : 'none';
                }
            });
        });
    });
}

/**
 * Initialize tabs
 */
function initTabs() {
    // Find all tab elements
    document.querySelectorAll('.nav-tabs .nav-link').forEach(tabLink => {
        tabLink.addEventListener('click', function(e) {
            e.preventDefault();

            // Get the target tab content
            const targetId = this.getAttribute('href');
            const targetContent = document.querySelector(targetId);

            // Hide all tab content
            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('show', 'active');
            });

            // Show the target tab content
            targetContent.classList.add('show', 'active');

            // Update active tab
            document.querySelectorAll('.nav-tabs .nav-link').forEach(link => {
                link.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
}

/**
 * Initialize puppy inquiry form
 */
function initPuppyInquiryForm() {
    const form = document.getElementById('puppy-inquiry-form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get form data
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const breedingId = document.getElementById('breeding-id').value;
        const message = document.getElementById('message').value;

        // Create WhatsApp message
        let whatsappMessage = `Hello! I'm interested in reserving a puppy from your kennel.\n\n`;
        whatsappMessage += `Name: ${name}\n`;
        whatsappMessage += `Email: ${email}\n`;
        whatsappMessage += `Phone: ${phone}\n`;

        if (breedingId) {
            whatsappMessage += `Breeding: ${breedingId}\n`;
        }

        whatsappMessage += `\nMessage: ${message}`;

        // Open WhatsApp with pre-filled message
        const whatsappURL = `https://wa.me/8801811936618?text=${encodeURIComponent(whatsappMessage)}`;
        window.open(whatsappURL, '_blank');

        // Reset form and show success message
        form.reset();

        // Show success alert
        const successAlert = document.createElement('div');
        successAlert.className = 'alert alert-success alert-dismissible fade show mt-3';
        successAlert.innerHTML = `
            <strong>Inquiry Sent!</strong> We've opened WhatsApp for you to complete your message. We'll get back to you as soon as possible.
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        form.appendChild(successAlert);

        // Remove alert after 5 seconds
        setTimeout(() => {
            successAlert.remove();
        }, 5000);
    });
}

/**
 * Populate inquiry form with breeding program information
 * @param {string} breedingId - ID of the breeding program
 */
async function populateInquiryForm(breedingId) {
    try {
        // Get breeding program data
        const response = await fetch('data/breeding-program.json');
        const breedingPrograms = await response.json();

        // Find the selected breeding program
        const program = breedingPrograms.find(p => p.id === breedingId);
        if (!program) return;

        // Get form elements
        const breedingIdInput = document.getElementById('breeding-id');
        const breedingInfoDiv = document.getElementById('breeding-info');

        // Set values
        if (breedingIdInput) breedingIdInput.value = breedingId;

        // Display breeding info
        if (breedingInfoDiv) {
            breedingInfoDiv.innerHTML = `
                <div class="alert alert-info">
                    <strong>Selected Litter:</strong> ${program.sire.name} & ${program.dam.name} (${program.sire.breed})
                    <br><strong>Expected:</strong> ${program.status === 'Active' ? formatDate(program.expected_birth) : formatDate(program.mating_date)}
                    <br><strong>Price:</strong> ৳ ${program.puppy_price.toLocaleString()}
                </div>
            `;
        }

    } catch (error) {
        console.error('Error populating inquiry form:', error);
    }
}

/**
 * Scroll to the inquiry form
 */
function scrollToInquiryForm() {
    const form = document.getElementById('puppy-inquiry-form');
    if (form) {
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/**
 * Format a date string to a readable format
 * @param {string} dateString - Date string
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}