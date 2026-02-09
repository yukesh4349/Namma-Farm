const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const geminiService = require('../services/geminiService');
const weatherService = require('../services/weatherService');
const User = require('../models/User');

/**
 * GET /api/advisory/weather
 * Get weather-based crop advisory
 */
router.get('/weather', authMiddleware, async (req, res) => {
    try {
        // Get user details
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const location = user.location || 'Chennai';
        const cropType = user.cropType || 'General crops';
        const language = user.language || 'en';

        // Get current weather
        const weather = await weatherService.getCurrentWeather(location);

        // Generate AI advisory
        const advisory = await geminiService.generateCropAdvisory(
            weather,
            cropType,
            language
        );

        res.json({
            success: true,
            weather,
            advisory,
            cropType,
            location
        });
    } catch (error) {
        console.error('Advisory Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating advisory'
        });
    }
});

/**
 * GET /api/advisory/soil
 * Get soil health analysis and recommendations
 */
router.get('/soil', authMiddleware, async (req, res) => {
    try {
        const sensorService = require('../services/sensorService');
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const cropType = user.cropType || 'General crops';
        const language = user.language || 'en';

        // Get soil sensor data (with fallback)
        const moistureData = await sensorService.getSensorData(req.userId, 'moisture');
        const nutritionData = await sensorService.getSensorData(req.userId, 'nutrition');

        // Prepare soil data for analysis
        const soilData = {
            moisture: moistureData.data || 50,
            nitrogen: nutritionData.data?.nitrogen || nutritionData.data?.N,
            phosphorus: nutritionData.data?.phosphorus || nutritionData.data?.P,
            potassium: nutritionData.data?.potassium || nutritionData.data?.K
        };

        // Generate AI recommendations
        const recommendations = await geminiService.analyzeSoilHealth(
            soilData,
            cropType,
            language
        );

        res.json({
            success: true,
            soilData: {
                moisture: moistureData,
                nutrition: nutritionData
            },
            recommendations,
            cropType
        });
    } catch (error) {
        console.error('Soil Advisory Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error analyzing soil health'
        });
    }
});

/**
 * GET /api/advisory/forecast
 * Get weather forecast
 */
router.get('/forecast', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const location = user?.location || 'Chennai';

        const forecast = await weatherService.getForecast(location);

        res.json({
            success: true,
            forecast,
            location
        });
    } catch (error) {
        console.error('Forecast Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching forecast'
        });
    }
});

module.exports = router;
