// ===================================
// DASHBOARD FUNCTIONALITY
// ===================================

// Check authentication
if (!requireAuth()) {
    // Redirect handled by requireAuth
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();

    // Auto-refresh every 30 seconds
    setInterval(loadDashboard, 30000);
});

// Load all dashboard data
async function loadDashboard() {
    const user = getUserData();
    if (user) {
        document.getElementById('userName').textContent = user.name;
    }

    // Update timestamp
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('lastUpdate').textContent = getCurrentLanguage() === 'ta'
        ? `கடைசியாக புதுப்பிக்கப்பட்டது: ${timeStr}`
        : `Last updated: ${timeStr}`;

    // Load all sections
    await Promise.all([
        loadWeatherAdvisory(),
        loadSoilHealth(),
        loadFireAlert(),
        loadYieldPrediction()
    ]);
}

// Load Weather Advisory
async function loadWeatherAdvisory() {
    try {
        const response = await apiRequest('/advisory/weather');

        if (response.success) {
            const { weather, advisory } = response;

            // Display weather info
            const weatherHTML = `
        <div class="weather-stat">
          <div class="weather-stat-label" data-en="Temperature" data-ta="வெப்பநிலை">Temperature</div>
          <div class="weather-stat-value">${weather.temperature}°C</div>
        </div>
        <div class="weather-stat">
          <div class="weather-stat-label" data-en="Humidity" data-ta="ஈரப்பதம்">Humidity</div>
          <div class="weather-stat-value">${weather.humidity}%</div>
        </div>
        <div class="weather-stat">
          <div class="weather-stat-label" data-en="Rainfall" data-ta="மழை">Rainfall</div>
          <div class="weather-stat-value">${weather.rainfall}mm</div>
        </div>
        <div class="weather-stat">
          <div class="weather-stat-label" data-en="Condition" data-ta="நிலை">Condition</div>
          <div class="weather-stat-value">${weather.condition}</div>
        </div>
      `;

            document.getElementById('weatherInfo').innerHTML = weatherHTML;
            document.getElementById('cropAdvisory').textContent = advisory;

            applyLanguage();
        }
    } catch (error) {
        console.error('Weather Advisory Error:', error);
        document.getElementById('cropAdvisory').textContent = getCurrentLanguage() === 'ta'
            ? 'வானிலை தரவு ஏற்ற முடியவில்லை'
            : 'Unable to load weather data';
    }
}

// Load Soil Health
async function loadSoilHealth() {
    try {
        const response = await apiRequest('/advisory/soil');

        if (response.success) {
            const { soilData, recommendations } = response;

            // Moisture level
            const moisture = soilData.moisture.data || 0;
            const moistureSource = soilData.moisture.source;

            document.getElementById('moistureBar').style.width = `${moisture}%`;
            document.getElementById('moistureBar').textContent = `${moisture}%`;
            document.getElementById('moistureValue').textContent = `${moisture}%`;

            // Color code based on level
            const bar = document.getElementById('moistureBar');
            if (moisture < 30) {
                bar.style.background = 'linear-gradient(90deg, #dc3545, #ff6b6b)';
            } else if (moisture < 60) {
                bar.style.background = 'linear-gradient(90deg, #ffc107, #ffdb4d)';
            } else {
                bar.style.background = 'linear-gradient(90deg, var(--secondary-green), var(--accent-green))';
            }

            // Source indicator
            document.getElementById('moistureSource').textContent = moistureSource === 'sensor'
                ? (getCurrentLanguage() === 'ta' ? '📡 சென்சார்' : '📡 Sensor')
                : (getCurrentLanguage() === 'ta' ? '🌐 ஆன்லைன்' : '🌐 Online');

            // Nutrition data
            const nutrition = soilData.nutrition.data;
            if (nutrition && typeof nutrition === 'object') {
                const nutritionHTML = `
          <div class="nutrition-item">
            <div class="nutrition-label">N</div>
            <div class="nutrition-value">${nutrition.nitrogen || nutrition.N || '--'}</div>
          </div>
          <div class="nutrition-item">
            <div class="nutrition-label">P</div>
            <div class="nutrition-value">${nutrition.phosphorus || nutrition.P || '--'}</div>
          </div>
          <div class="nutrition-item">
            <div class="nutrition-label">K</div>
            <div class="nutrition-value">${nutrition.potassium || nutrition.K || '--'}</div>
          </div>
        `;
                document.getElementById('soilNutrition').innerHTML = nutritionHTML;
            }

            // Recommendations
            document.getElementById('soilRecommendations').textContent = recommendations;
        }
    } catch (error) {
        console.error('Soil Health Error:', error);
        document.getElementById('soilRecommendations').textContent = getCurrentLanguage() === 'ta'
            ? 'மண் தரவு ஏற்ற முடியவில்லை'
            : 'Unable to load soil data';
    }
}

// Load Fire Alert
async function loadFireAlert() {
    try {
        const response = await apiRequest('/alerts/fire');

        if (response.success) {
            const { alert } = response;

            const fireStatusDiv = document.getElementById('fireStatus');
            const alertBanner = document.getElementById('fireAlertBanner');

            if (alert.alert) {
                // FIRE DETECTED!
                fireStatusDiv.className = 'fire-status danger';
                fireStatusDiv.innerHTML = `
          <div class="fire-status-icon">🔥</div>
          <div class="fire-status-text">${alert.message}</div>
          ${alert.actions ? `
            <div class="fire-actions">
              <ul>
                ${alert.actions.map(action => `<li>⚠️ ${action}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        `;

                // Show banner
                alertBanner.textContent = `🚨 ${alert.message}`;
                alertBanner.classList.remove('hidden');

                // Voice alert
                if (voiceAssistant.isVoiceEnabled()) {
                    voiceAssistant.speak(alert.message);
                }
            } else {
                // All clear
                fireStatusDiv.className = 'fire-status safe';
                fireStatusDiv.innerHTML = `
          <div class="fire-status-icon">✅</div>
          <div class="fire-status-text">${alert.message}</div>
        `;

                // Hide banner
                alertBanner.classList.add('hidden');
            }
        }
    } catch (error) {
        console.error('Fire Alert Error:', error);
        document.getElementById('fireStatus').innerHTML = `
      <p>${getCurrentLanguage() === 'ta' ? 'தீ எச்சரிக்கை தரவு ஏற்ற முடியவில்லை' : 'Unable to load fire alert data'}</p>
    `;
    }
}

// Load Yield Prediction
async function loadYieldPrediction() {
    try {
        const response = await apiRequest('/prediction/summary');

        if (response.success) {
            document.getElementById('yieldPrediction').textContent = response.summary;
        }
    } catch (error) {
        console.error('Yield Prediction Error:', error);
        document.getElementById('yieldPrediction').textContent = getCurrentLanguage() === 'ta'
            ? 'விளைச்சல் கணிப்பு ஏற்ற முடியவில்லை'
            : 'Unable to load yield prediction';
    }
}

// Toggle voice assistant
function toggleVoice() {
    const isEnabled = voiceAssistant.toggle();
    const voiceIcon = document.getElementById('voiceIcon');
    const voiceToggle = document.getElementById('voiceToggle');

    if (isEnabled) {
        voiceIcon.textContent = '🔊';
        voiceToggle.classList.add('active');
        voiceAssistant.speak(getCurrentLanguage() === 'ta'
            ? 'குரல் உதவியாளர் இயக்கப்பட்டது'
            : 'Voice assistant enabled');
    } else {
        voiceIcon.textContent = '🔇';
        voiceToggle.classList.remove('active');
    }
}
