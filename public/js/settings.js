// ===================================
// SETTINGS PAGE FUNCTIONALITY
// ===================================

if (!requireAuth()) {
    // Redirect handled
}

document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
    loadSensors();
    loadSettings();
});

// Load user profile
async function loadUserProfile() {
    try {
        const response = await apiRequest('/auth/profile');

        if (response.success) {
            const user = response.user;

            const profileHTML = `
        <p><strong data-en="Name:" data-ta="பெயர்:">Name:</strong> ${user.name}</p>
        <p><strong data-en="Phone:" data-ta="தொலைபேசி:">Phone:</strong> ${user.phone}</p>
        <p><strong data-en="Location:" data-ta="இடம்:">Location:</strong> ${user.location || 'Not set'}</p>
        <p><strong data-en="Crop Type:" data-ta="பயிர் வகை:">Crop Type:</strong> ${user.cropType || 'Not set'}</p>
        <p><strong data-en="Language:" data-ta="மொழி:">Language:</strong> ${user.language === 'ta' ? 'தமிழ்' : 'English'}</p>
      `;

            document.getElementById('userProfile').innerHTML = profileHTML;
            document.getElementById('userId').textContent = user._id;

            applyLanguage();
        }
    } catch (error) {
        console.error('Profile Error:', error);
        document.getElementById('userProfile').innerHTML = '<p>Unable to load profile</p>';
    }
}

// Load sensors
async function loadSensors() {
    try {
        const response = await apiRequest('/sensors/list');

        if (response.success) {
            const sensors = response.sensors;

            if (sensors.length === 0) {
                document.getElementById('sensorList').innerHTML = `
          <p data-en="No sensors registered yet. Add your first sensor below." data-ta="இன்னும் சென்சார்கள் பதிவு செய்யப்படவில்லை. கீழே உங்கள் முதல் சென்சாரைச் சேர்க்கவும்.">
            No sensors registered yet. Add your first sensor below.
          </p>
        `;
            } else {
                const sensorsHTML = sensors.map(sensor => `
          <div class="sensor-item" style="background: var(--light-gray); padding: var(--spacing-md); border-radius: var(--radius-md); margin-bottom: var(--spacing-md);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong>${sensor.name}</strong><br>
                <small>ID: ${sensor.id} | Type: ${sensor.type}</small><br>
                <span style="color: ${sensor.enabled ? 'var(--success)' : 'var(--gray)'};">
                  ${sensor.enabled ? '✓ Enabled' : '✗ Disabled'}
                </span>
              </div>
              <div>
                <button class="btn btn-sm btn-secondary" onclick="toggleSensor('${sensor.id}')" data-en="${sensor.enabled ? 'Disable' : 'Enable'}" data-ta="${sensor.enabled ? 'முடக்கு' : 'இயக்கு'}">
                  ${sensor.enabled ? 'Disable' : 'Enable'}
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteSensor('${sensor.id}')" data-en="Remove" data-ta="அகற்று">Remove</button>
              </div>
            </div>
          </div>
        `).join('');

                document.getElementById('sensorList').innerHTML = sensorsHTML;
            }

            applyLanguage();
        }
    } catch (error) {
        console.error('Sensors Error:', error);
        document.getElementById('sensorList').innerHTML = '<p>Unable to load sensors</p>';
    }
}

// Load settings
async function loadSettings() {
    try {
        const response = await apiRequest('/settings');

        if (response.success) {
            document.getElementById('useFallback').checked = response.settings.useFallback;
        }
    } catch (error) {
        console.error('Settings Error:', error);
    }
}

// Show add sensor form
function showAddSensorForm() {
    document.getElementById('addSensorForm').classList.remove('hidden');
}

// Hide add sensor form
function hideAddSensorForm() {
    document.getElementById('addSensorForm').classList.add('hidden');
    document.getElementById('sensorId').value = '';
    document.getElementById('sensorName').value = '';
}

// Add sensor
async function handleAddSensor(event) {
    event.preventDefault();

    const sensorId = document.getElementById('sensorId').value.trim();
    const sensorType = document.getElementById('sensorType').value;
    const sensorName = document.getElementById('sensorName').value.trim();

    try {
        const response = await apiRequest('/sensors/register', {
            method: 'POST',
            body: JSON.stringify({
                sensorId,
                type: sensorType,
                name: sensorName
            })
        });

        if (response.success) {
            showAlert(getCurrentLanguage() === 'ta'
                ? 'சென்சார் வெற்றிகரமாகப் பதிவு செய்யப்பட்டது!'
                : 'Sensor registered successfully!', 'success');

            hideAddSensorForm();
            loadSensors();
        }
    } catch (error) {
        showAlert(error.message || (getCurrentLanguage() === 'ta'
            ? 'சென்சார் பதிவு தோல்வியுற்றது'
            : 'Failed to register sensor'), 'danger');
    }
}

// Toggle sensor
async function toggleSensor(sensorId) {
    try {
        const response = await apiRequest(`/sensors/${sensorId}/toggle`, {
            method: 'PUT'
        });

        if (response.success) {
            showAlert(response.message, 'success');
            loadSensors();
        }
    } catch (error) {
        showAlert('Failed to toggle sensor', 'danger');
    }
}

// Delete sensor
async function deleteSensor(sensorId) {
    if (!confirm(getCurrentLanguage() === 'ta'
        ? 'இந்த சென்சாரை அகற்ற விரும்புகிறீர்களா?'
        : 'Are you sure you want to remove this sensor?')) {
        return;
    }

    try {
        const response = await apiRequest(`/sensors/${sensorId}`, {
            method: 'DELETE'
        });

        if (response.success) {
            showAlert(getCurrentLanguage() === 'ta'
                ? 'சென்சார் அகற்றப்பட்டது'
                : 'Sensor removed', 'success');
            loadSensors();
        }
    } catch (error) {
        showAlert('Failed to remove sensor', 'danger');
    }
}

// Update fallback setting
async function updateFallbackSetting() {
    const useFallback = document.getElementById('useFallback').checked;

    try {
        const response = await apiRequest('/settings', {
            method: 'PUT',
            body: JSON.stringify({ useFallback })
        });

        if (response.success) {
            showAlert(getCurrentLanguage() === 'ta'
                ? 'அமைப்புகள் புதுப்பிக்கப்பட்டன'
                : 'Settings updated', 'success');
        }
    } catch (error) {
        showAlert('Failed to update settings', 'danger');
    }
}
