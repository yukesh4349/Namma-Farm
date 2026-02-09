const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const sensorService = require('../services/sensorService');
const User = require('../models/User');

/**
 * GET /api/alerts/fire
 * Check fire alert status
 */
router.get('/fire', authMiddleware, async (req, res) => {
    try {
        const fireAlert = await sensorService.checkFireAlert(req.userId);

        const user = await User.findById(req.userId);
        const language = user?.language || 'en';

        // Translate message if Tamil
        if (language === 'ta' && fireAlert.alert) {
            fireAlert.message = 'தீ/புகை கண்டறியப்பட்டது! உடனடியாக நடவடிக்கை எடுக்கவும்!';
            fireAlert.actions = [
                'உடனடியாக பகுதியை காலி செய்யவும்',
                'தீயணைப்பு துறைக்கு தெரிவிக்கவும்',
                'அருகில் உள்ள நீர் ஆதாரங்களை பயன்படுத்தவும்',
                'மற்றவர்களை எச்சரிக்கவும்'
            ];
        } else if (language === 'ta') {
            fireAlert.message = 'தீ கண்டறியப்படவில்லை. பாதுகாப்பானது.';
        } else if (fireAlert.alert) {
            fireAlert.actions = [
                'Evacuate the area immediately',
                'Call fire department',
                'Use nearby water sources',
                'Alert others in the vicinity'
            ];
        }

        res.json({
            success: true,
            alert: fireAlert
        });
    } catch (error) {
        console.error('Fire Alert Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking fire alert'
        });
    }
});

/**
 * GET /api/alerts/all
 * Get all alerts (fire, low moisture, etc.)
 */
router.get('/all', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const language = user?.language || 'en';

        // Check fire alert
        const fireAlert = await sensorService.checkFireAlert(req.userId);

        // Check soil moisture
        const moistureData = await sensorService.getSensorData(req.userId, 'moisture');
        const lowMoisture = moistureData.data < 30;

        const alerts = [];

        // Fire alert
        if (fireAlert.alert) {
            alerts.push({
                type: 'fire',
                level: 'CRITICAL',
                message: language === 'ta'
                    ? 'தீ/புகை கண்டறியப்பட்டது!'
                    : 'Fire/Smoke detected!',
                timestamp: fireAlert.timestamp
            });
        }

        // Low moisture alert
        if (lowMoisture) {
            alerts.push({
                type: 'moisture',
                level: 'WARNING',
                message: language === 'ta'
                    ? 'மண் ஈரப்பதம் குறைவாக உள்ளது - நீர்ப்பாசனம் தேவை'
                    : 'Low soil moisture - irrigation needed',
                timestamp: moistureData.timestamp
            });
        }

        res.json({
            success: true,
            alerts,
            count: alerts.length
        });
    } catch (error) {
        console.error('Alerts Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching alerts'
        });
    }
});

module.exports = router;
