// ===================================
// MULTILINGUAL SUPPORT
// Tamil & English
// ===================================

const translations = {
    en: {
        // Navigation
        'Namma Farm': 'Namma Farm',
        'Login': 'Login',
        'Sign Up': 'Sign Up',

        // Hero
        'Smart Farming for a Better Tomorrow': 'Smart Farming for a Better Tomorrow',
        'AI-powered agricultural assistance with real-time monitoring, weather advisories, and crop yield predictions':
            'AI-powered agricultural assistance with real-time monitoring, weather advisories, and crop yield predictions',
        'Get Started Free': 'Get Started Free',
        'Learn More': 'Learn More',

        // Features
        'Our Features': 'Our Features',
        'Everything you need for modern farming': 'Everything you need for modern farming',
        'Weather-Based Crop Advisory': 'Weather-Based Crop Advisory',
        'Soil Health Monitoring': 'Soil Health Monitoring',
        'Fire Alert System': 'Fire Alert System',
        'AI Crop Yield Prediction': 'AI Crop Yield Prediction',

        // How It Works
        'How It Works': 'How It Works',
        'Sign Up': 'Sign Up',
        'Connect Sensors': 'Connect Sensors',
        'Get Insights': 'Get Insights',
        'Grow Better': 'Grow Better',

        // CTA
        'Ready to Transform Your Farm?': 'Ready to Transform Your Farm?',
        'Start Free Today': 'Start Free Today',

        // Footer
        'Quick Links': 'Quick Links',
        'Support': 'Support',
        'All rights reserved.': 'All rights reserved.'
    },

    ta: {
        // Navigation
        'Namma Farm': 'நம்ம பண்ணை',
        'Login': 'உள்நுழைய',
        'Sign Up': 'பதிவு செய்ய',

        // Hero
        'Smart Farming for a Better Tomorrow': 'சிறந்த நாளைக்கான அறிவார்ந்த விவசாயம்',
        'AI-powered agricultural assistance with real-time monitoring, weather advisories, and crop yield predictions':
            'நேரடி கண்காணிப்பு, வானிலை ஆலோசனைகள் மற்றும் பயிர் விளைச்சல் கணிப்புகளுடன் AI-இயங்கும் விவசாய உதவி',
        'Get Started Free': 'இலவசமாக தொடங்குங்கள்',
        'Learn More': 'மேலும் அறிய',

        // Features
        'Our Features': 'எங்கள் அம்சங்கள்',
        'Everything you need for modern farming': 'நவீன விவசாயத்திற்கு தேவையான அனைத்தும்',
        'Weather-Based Crop Advisory': 'வானிலை அடிப்படையிலான பயிர் ஆலோசனை',
        'Soil Health Monitoring': 'மண் ஆரோக்கிய கண்காணிப்பு',
        'Fire Alert System': 'தீ எச்சரிக்கை அமைப்பு',
        'AI Crop Yield Prediction': 'AI பயிர் விளைச்சல் கணிப்பு',

        // How It Works
        'How It Works': 'இது எவ்வாறு செயல்படுகிறது',
        'Sign Up': 'பதிவு செய்யவும்',
        'Connect Sensors': 'சென்சார்களை இணைக்கவும்',
        'Get Insights': 'நுண்ணறிவுகளைப் பெறுங்கள்',
        'Grow Better': 'சிறப்பாக வளருங்கள்',

        // CTA
        'Ready to Transform Your Farm?': 'உங்கள் பண்ணையை மாற்ற தயாரா?',
        'Start Free Today': 'இன்றே இலவசமாக தொடங்குங்கள்',

        // Footer
        'Quick Links': 'விரைவு இணைப்புகள்',
        'Support': 'ஆதரவு',
        'All rights reserved.': 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.'
    }
};

// Current language
let currentLang = localStorage.getItem('nammaFarmLang') || 'en';

// Toggle language
function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'ta' : 'en';
    localStorage.setItem('nammaFarmLang', currentLang);
    applyLanguage();
}

// Apply language to page
function applyLanguage() {
    // Update body class for font
    if (currentLang === 'ta') {
        document.body.classList.add('tamil');
    } else {
        document.body.classList.remove('tamil');
    }

    // Update language toggle button
    const langToggle = document.getElementById('langText');
    if (langToggle) {
        langToggle.textContent = currentLang === 'en' ? 'தமிழ்' : 'English';
    }

    // Update all elements with data-en and data-ta attributes
    const elements = document.querySelectorAll('[data-en][data-ta]');
    elements.forEach(element => {
        const text = currentLang === 'en' ? element.getAttribute('data-en') : element.getAttribute('data-ta');
        if (text) {
            element.textContent = text;
        }
    });

    // Update placeholders
    const inputs = document.querySelectorAll('[data-placeholder-en][data-placeholder-ta]');
    inputs.forEach(input => {
        const placeholder = currentLang === 'en'
            ? input.getAttribute('data-placeholder-en')
            : input.getAttribute('data-placeholder-ta');
        if (placeholder) {
            input.placeholder = placeholder;
        }
    });
}

// Initialize language on page load
document.addEventListener('DOMContentLoaded', () => {
    applyLanguage();
});

// Get translation
function t(key) {
    return translations[currentLang][key] || key;
}

// Get current language
function getCurrentLanguage() {
    return currentLang;
}
