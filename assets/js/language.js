// language.js

// Language management module
const LanguageManager = (function() {
    // Default language
    let currentLanguage = 'en';

    // Cache for language data
    const languageData = {
        en: null,
        bn: null
    };

    // DOM elements that need translation
    const translatableElements = [];

    // Initialize the language system
    function init() {
        // Get preferred language from localStorage or default to 'en'
        currentLanguage = localStorage.getItem('kkpLanguage') || 'en';

        // Set initial HTML lang attribute
        document.documentElement.lang = currentLanguage;

        // Find all translatable elements
        document.querySelectorAll('[data-lang-key]').forEach(element => {
            translatableElements.push(element);
        });

        // Load language data
        loadLanguageData(currentLanguage, function() {
            // Apply translations after data is loaded
            applyTranslations();
        });

        // Set up language toggle button
        const langToggle = document.querySelector('.lang-toggle');
        if (langToggle) {
            langToggle.addEventListener('click', toggleLanguage);
            // Update button text
            updateToggleButton();
        }
    }

    // Load language data from JSON file
    function loadLanguageData(lang, callback) {
        if (languageData[lang]) {
            // Data already loaded
            if (callback) callback();
            return;
        }

        fetch(`assets/lang/${lang}.json`)
            .then(response => response.json())
            .then(data => {
                languageData[lang] = data;
                if (callback) callback();
            })
            .catch(error => {
                console.error(`Error loading language data for ${lang}:`, error);
            });
    }

    // Apply translations to the page
    function applyTranslations() {
        if (!languageData[currentLanguage]) return;

        translatableElements.forEach(element => {
            const key = element.getAttribute('data-lang-key');
            const text = getTranslation(key);

            if (text) {
                // Handle different element types
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    // For form elements
                    if (element.getAttribute('placeholder')) {
                        element.setAttribute('placeholder', text);
                    } else {
                        element.value = text;
                    }
                } else {
                    // For regular elements
                    element.innerHTML = text;
                }
            }
        });

        // Toggle site title based on language
        const enTitle = document.querySelector('.en-title');
        const bnTitle = document.querySelector('.bn-title');

        if (enTitle && bnTitle) {
            if (currentLanguage === 'en') {
                enTitle.classList.remove('d-none');
                enTitle.classList.add('d-block');
                bnTitle.classList.remove('d-block');
                bnTitle.classList.add('d-none');
            } else {
                enTitle.classList.remove('d-block');
                enTitle.classList.add('d-none');
                bnTitle.classList.remove('d-none');
                bnTitle.classList.add('d-block');
            }
        }

        // Add appropriate font class based on language
        document.body.classList.remove('en', 'bn');
        document.body.classList.add(currentLanguage);
    }

    // Get translation for a key
    function getTranslation(key) {
        if (!languageData[currentLanguage] || !key) return '';

        // Split key by dots to access nested properties
        const parts = key.split('.');
        let translation = languageData[currentLanguage];

        for (const part of parts) {
            if (translation[part] === undefined) {
                console.warn(`Translation missing for key: ${key}`);
                return key; // Return the key itself as fallback
            }
            translation = translation[part];
        }

        return translation;
    }

    // Toggle between languages
    function toggleLanguage() {
        currentLanguage = currentLanguage === 'en' ? 'bn' : 'en';

        // Save preference to localStorage
        localStorage.setItem('kkpLanguage', currentLanguage);

        // Update HTML lang attribute
        document.documentElement.lang = currentLanguage;

        // Load language data if not loaded yet
        loadLanguageData(currentLanguage, function() {
            // Apply translations after data is loaded
            applyTranslations();

            // Update toggle button text
            updateToggleButton();
        });
    }

    // Update the language toggle button text
    function updateToggleButton() {
        const langToggle = document.querySelector('.lang-toggle');
        if (!langToggle) return;

        langToggle.textContent = currentLanguage === 'en' ? 'বাংলা' : 'English';
    }

    // Public API
    return {
        init: init,
        getCurrentLanguage: () => currentLanguage,
        getTranslation: getTranslation,
        toggleLanguage: toggleLanguage
    };
})();

// Initialize language manager when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    LanguageManager.init();
});