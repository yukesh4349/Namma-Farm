// ===================================
// VOICE ASSISTANT
// Text-to-Speech Support
// ===================================

class VoiceAssistant {
    constructor() {
        this.synthesis = window.speechSynthesis;
        this.isEnabled = localStorage.getItem('voiceEnabled') === 'true';
    }

    // Speak text in current language
    speak(text, lang = null) {
        if (!this.isEnabled || !this.synthesis) {
            return;
        }

        // Cancel any ongoing speech
        this.synthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Set language
        const currentLang = lang || getCurrentLanguage();
        utterance.lang = currentLang === 'ta' ? 'ta-IN' : 'en-IN';

        // Voice settings
        utterance.rate = 0.9; // Slightly slower for clarity
        utterance.pitch = 1;
        utterance.volume = 1;

        // Speak
        this.synthesis.speak(utterance);
    }

    // Stop speaking
    stop() {
        if (this.synthesis) {
            this.synthesis.cancel();
        }
    }

    // Enable voice assistant
    enable() {
        this.isEnabled = true;
        localStorage.setItem('voiceEnabled', 'true');
    }

    // Disable voice assistant
    disable() {
        this.isEnabled = false;
        localStorage.setItem('voiceEnabled', 'false');
        this.stop();
    }

    // Toggle voice assistant
    toggle() {
        if (this.isEnabled) {
            this.disable();
        } else {
            this.enable();
        }
        return this.isEnabled;
    }

    // Check if voice is enabled
    isVoiceEnabled() {
        return this.isEnabled;
    }
}

// Create global voice assistant instance
const voiceAssistant = new VoiceAssistant();

// Speak alert messages automatically
function speakAlert(message) {
    voiceAssistant.speak(message);
}
