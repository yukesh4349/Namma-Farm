const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const geminiService = require('../services/geminiService');
const sensorService = require('../services/sensorService');
const weatherService = require('../services/weatherService');
const User = require('../models/User');

/**
 * POST /api/prediction/yield
 * Predict crop yield based on multiple factors
 */
router.post('/yield', authMiddleware, async (req, res) => {
    try {
        const { area } = req.body; // Area in acres

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const location = user.location || 'Chennai';
        const cropType = user.cropType || 'Rice';
        const language = user.language || 'en';

        // Get weather data
        const weather = await weatherService.getCurrentWeather(location);

        // Get soil data
        const moistureData = await sensorService.getSensorData(req.userId, 'moisture');
        const nutritionData = await sensorService.getSensorData(req.userId, 'nutrition');

        // Prepare data for prediction
        const predictionData = {
            weather: {
                temperature: weather.temperature,
                humidity: weather.humidity,
                rainfall: weather.rainfall
            },
            soil: {
                moisture: moistureData.data || 50,
                nitrogen: nutritionData.data?.nitrogen || nutritionData.data?.N,
                phosphorus: nutritionData.data?.phosphorus || nutritionData.data?.P,
                potassium: nutritionData.data?.potassium || nutritionData.data?.K
            },
            cropType,
            area: area || 1
        };

        // Generate AI prediction
        const prediction = await geminiService.predictYield(predictionData, language);

        res.json({
            success: true,
            prediction,
            data: {
                cropType,
                area: predictionData.area,
                weather: predictionData.weather,
                soil: predictionData.soil,
                location
            }
        });
    } catch (error) {
        console.error('Yield Prediction Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error predicting yield'
        });
    }
});

/**
 * GET /api/prediction/summary
 * Get prediction summary for dashboard
 */
router.get('/summary', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const cropType = user?.cropType || 'General crops';
        const language = user?.language || 'en';

        // Get basic prediction with default area
        const moistureData = await sensorService.getSensorData(req.userId, 'moisture');
        const weather = await weatherService.getCurrentWeather(user?.location || 'Chennai');

        const predictionData = {
            weather: {
                temperature: weather.temperature,
                humidity: weather.humidity,
                rainfall: weather.rainfall
            },
            soil: {
                moisture: moistureData.data || 50
            },
            cropType,
            area: 1
        };

        const prediction = await geminiService.predictYield(predictionData, language);

        res.json({
            success: true,
            summary: prediction,
            cropType
        });
    } catch (error) {
        console.error('Prediction Summary Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating prediction summary'
        });
    }
});

module.exports = router;
