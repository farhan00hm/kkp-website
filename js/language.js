/**
 * KKP - Khundkar Khamar Prakalpa
 * Language switching functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize language based on localStorage or default to English
    const currentLang = localStorage.getItem('kkp-language') || 'en';
    setLanguage(currentLang);

    // Add event listener to language switcher
    const languageSwitcher = document.getElementById('language-switch');
    if (languageSwitcher) {
        languageSwitcher.addEventListener('click', toggleLanguage);
    }
});

/**
 * Toggle between English and Bengali
 */
function toggleLanguage() {
    const currentLang = document.documentElement.lang;
    const newLang = currentLang === 'en' ? 'bn' : 'en';
    setLanguage(newLang);

    // Redirect to the equivalent page in the other language
    redirectToTranslatedPage(newLang);
}

/**
 * Set the language for the site
 * @param {string} lang - Language code ('en' or 'bn')
 */
function setLanguage(lang) {
    document.documentElement.lang = lang;
    document.body.setAttribute('lang', lang);

    // Update language switcher text
    const languageSwitcher = document.getElementById('language-switch');
    if (languageSwitcher) {
        languageSwitcher.textContent = lang === 'en' ? 'বাংলা' : 'English';
    }

    // Store language preference
    localStorage.setItem('kkp-language', lang);
}

/**
 * Redirect to the equivalent page in the target language
 * @param {string} targetLang - Target language code ('en' or 'bn')
 */
function redirectToTranslatedPage(targetLang) {
    const currentPath = window.location.pathname;
    let newPath;

    if (currentPath.endsWith('.bn.html')) {
        // Currently on Bengali page, switch to English
        newPath = currentPath.replace('.bn.html', '.html');
    } else if (currentPath.endsWith('.html') && !currentPath.endsWith('.bn.html')) {
        // Currently on English page, switch to Bengali
        newPath = currentPath.replace('.html', '.bn.html');
    } else if (currentPath.endsWith('/bn/')) {
        // Alternative structure: Currently on Bengali page in /bn/ folder
        newPath = currentPath.replace('/bn/', '/en/');
    } else if (currentPath.endsWith('/en/')) {
        // Alternative structure: Currently on English page in /en/ folder
        newPath = currentPath.replace('/en/', '/bn/');
    } else {
        // Handle index or home page
        newPath = targetLang === 'en' ? 'index.html' : 'index.bn.html';
    }

    window.location.href = newPath;
}