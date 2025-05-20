// Enhanced language.js

// Language management module
const LanguageManager = (function() {
    // Default language
    let currentLanguage = 'en';

    // Available languages
    const availableLanguages = ['en', 'bn'];

    // Cache for language data
    const languageData = {
        en: null,
        bn: null
    };

    // Initialize the language system
    function init() {
        // Get preferred language from localStorage or browser setting or default to 'en'
        currentLanguage = localStorage.getItem('kkpLanguage') ||
                         getBrowserLanguage() ||
                         'en';

        // Validate language is available
        if (!availableLanguages.includes(currentLanguage)) {
            currentLanguage = 'en';
        }

        // Set initial HTML lang attribute
        document.documentElement.lang = currentLanguage;
        document.body.classList.add(`lang-${currentLanguage}`);

        // Load language data
        loadLanguageData(currentLanguage, function() {
            // Apply translations after data is loaded
            applyTranslations();
        });

        // Set up language toggle button
        const langToggle = document.getElementById('langToggle');
        if (langToggle) {
            langToggle.addEventListener('click', toggleLanguage);
            // Update button text
            updateToggleButton();
        }
    }

    // Get browser language preference
    function getBrowserLanguage() {
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang) {
            // Get the first two characters (language code)
            const langCode = browserLang.substring(0, 2).toLowerCase();

            // Check if it's in our available languages
            if (availableLanguages.includes(langCode)) {
                return langCode;
            }
        }
        return null;
    }

    // Load language data from JSON file
    function loadLanguageData(lang, callback) {
        if (languageData[lang]) {
            // Data already loaded
            if (callback) callback();
            return;
        }

        fetch(`assets/lang/${lang}.json`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load ${lang} language data`);
                }
                return response.json();
            })
            .then(data => {
                languageData[lang] = data;
                if (callback) callback();
            })
            .catch(error => {
                console.error(`Error loading language data for ${lang}:`, error);
                // Fall back to English if available
                if (lang !== 'en' && languageData['en']) {
                    console.log('Falling back to English language');
                    currentLanguage = 'en';
                    document.documentElement.lang = 'en';
                    if (callback) callback();
                }
            });
    }

    // Apply translations to the page
    function applyTranslations() {
        if (!languageData[currentLanguage]) return;

        // Find all elements with data-lang-key attribute
        document.querySelectorAll('[data-lang-key]').forEach(element => {
            const key = element.getAttribute('data-lang-key');
            const text = getTranslation(key);

            if (text) {
                // Handle different element types
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    if (element.getAttribute('placeholder')) {
                        element.setAttribute('placeholder', text);
                    } else {
                        element.value = text;
                    }
                } else {
                    element.innerHTML = text;
                }
            }
        });

        // Update page direction if needed (for RTL languages)
        document.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';

        // Update language specific classes
        document.body.classList.remove(...availableLanguages.map(lang => `lang-${lang}`));
        document.body.classList.add(`lang-${currentLanguage}`);

        // Dispatch event to notify other components
        const event = new CustomEvent('languageChanged', {
            detail: { language: currentLanguage }
        });
        document.dispatchEvent(event);
    }

    // Get translation for a key
    function getTranslation(key) {
        if (!languageData[currentLanguage]) return '';
        if (!key) return '';

        // Split key by dots to access nested properties
        const parts = key.split('.');
        let translation = languageData[currentLanguage];

        for (const part of parts) {
            if (!translation || translation[part] === undefined) {
                // Try to fall back to English if key is missing in current language
                if (currentLanguage !== 'en' && languageData['en']) {
                    let enTranslation = languageData['en'];
                    let found = true;

                    for (const p of parts) {
                        if (!enTranslation || enTranslation[p] === undefined) {
                            found = false;
                            break;
                        }
                        enTranslation = enTranslation[p];
                    }

                    if (found) return enTranslation;
                }

                console.warn(`Translation missing for key: ${key}`);
                return key.split('.').pop(); // Return last part of key as fallback
            }
            translation = translation[part];
        }

        return translation;
    }

    // Toggle between languages
    function toggleLanguage() {
        // Get next language in the array
        const currentIndex = availableLanguages.indexOf(currentLanguage);
        const nextIndex = (currentIndex + 1) % availableLanguages.length;
        currentLanguage = availableLanguages[nextIndex];

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

            // Show confirmation message
            showLanguageChangeMessage();
        });
    }

    // Update the language toggle button text
    function updateToggleButton() {
        const langToggle = document.getElementById('langToggle');
        if (!langToggle) return;

        // Show next language to switch to
        const currentIndex = availableLanguages.indexOf(currentLanguage);
        const nextIndex = (currentIndex + 1) % availableLanguages.length;
        const nextLang = availableLanguages[nextIndex];

        // Language names
        const langNames = {
            'en': 'English',
            'bn': 'বাংলা'
        };

        langToggle.textContent = langNames[nextLang] || nextLang;
    }

    // Show language change confirmation message
    function showLanguageChangeMessage() {
        // Only show if toast function is available
        if (typeof showToast === 'function') {
            const message = currentLanguage === 'en'
                ? 'Language changed to English'
                : 'ভাষা বাংলায় পরিবর্তন করা হয়েছে';

            showToast(message);
        }
    }

    // Public API
    return {
        init: init,
        getCurrentLanguage: () => currentLanguage,
        getTranslation: getTranslation,
        toggleLanguage: toggleLanguage,
        applyTranslations: applyTranslations
    };
})();

// Initialize on document ready or template loaded event
document.addEventListener('DOMContentLoaded', function() {
    // If header is loaded via template, wait for a moment
    setTimeout(() => {
        if (document.getElementById('langToggle')) {
            LanguageManager.init();
        }
    }, 100);
});

// Also listen for template-loaded event if custom event is used
document.addEventListener('templateLoaded', function() {
    if (document.getElementById('langToggle')) {
        LanguageManager.init();
    }
});