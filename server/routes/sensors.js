const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const sensorService = require('../services/sensorService');
const Settings = require('../models/Settings');

/**
 * POST /api/sensors/data
 * Receive sensor data from IoT devices (webhook)
 */
router.post('/data', async (req, res) => {
    try {
        const { userId, sensorId, type, value, timestamp } = req.body;

        // Validate input
        if (!userId || !sensorId || !type || value === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: userId, sensorId, type, value'
            });
        }

        // Save sensor data
        const sensorData = await sensorService.saveSensorData({
            userId,
            sensorId,
            type,
            value,
            timestamp: timestamp || new Date()
        });

        res.json({
            success: true,
            message: 'Sensor data received',
            data: sensorData
        });
    } catch (error) {
        console.error('Sensor Data Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving sensor data'
        });
    }
});

/**
 * GET /api/sensors/latest
 * Get latest sensor readings (protected)
 */
router.get('/latest', authMiddleware, async (req, res) => {
    try {
        const allData = await sensorService.getAllSensorData(req.userId);

        res.json({
            success: true,
            data: allData
        });
    } catch (error) {
        console.error('Get Sensors Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching sensor data'
        });
    }
});

/**
 * GET /api/sensors/latest/:type
 * Get latest reading for specific sensor type
 */
router.get('/latest/:type', authMiddleware, async (req, res) => {
    try {
        const { type } = req.params;
        const data = await sensorService.getSensorData(req.userId, type);

        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Get Sensor Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching sensor data'
        });
    }
});

/**
 * POST /api/sensors/register
 * Register a new sensor
 */
router.post('/register', authMiddleware, async (req, res) => {
    try {
        const { sensorId, type, name } = req.body;

        if (!sensorId || !type || !name) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: sensorId, type, name'
            });
        }

        // Get or create settings
        let settings = await Settings.findOne({ userId: req.userId });

        if (!settings) {
            settings = new Settings({ userId: req.userId, sensors: [] });
        }

        // Check if sensor already exists
        const existingSensor = settings.sensors.find(s => s.id === sensorId);
        if (existingSensor) {
            return res.status(400).json({
                success: false,
                message: 'Sensor ID already registered'
            });
        }

        // Add sensor
        settings.sensors.push({
            id: sensorId,
            type,
            name,
            enabled: true
        });

        await settings.save();

        res.json({
            success: true,
            message: 'Sensor registered successfully',
            sensor: { id: sensorId, type, name, enabled: true }
        });
    } catch (error) {
        console.error('Register Sensor Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering sensor'
        });
    }
});

/**
 * GET /api/sensors/list
 * Get all registered sensors
 */
router.get('/list', authMiddleware, async (req, res) => {
    try {
        const settings = await Settings.findOne({ userId: req.userId });

        res.json({
            success: true,
            sensors: settings?.sensors || []
        });
    } catch (error) {
        console.error('List Sensors Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching sensors'
        });
    }
});

/**
 * DELETE /api/sensors/:sensorId
 * Remove a sensor
 */
router.delete('/:sensorId', authMiddleware, async (req, res) => {
    try {
        const { sensorId } = req.params;

        const settings = await Settings.findOne({ userId: req.userId });
        if (!settings) {
            return res.status(404).json({
                success: false,
                message: 'No sensors found'
            });
        }

        settings.sensors = settings.sensors.filter(s => s.id !== sensorId);
        await settings.save();

        res.json({
            success: true,
            message: 'Sensor removed successfully'
        });
    } catch (error) {
        console.error('Delete Sensor Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing sensor'
        });
    }
});

/**
 * PUT /api/sensors/:sensorId/toggle
 * Enable/disable a sensor
 */
router.put('/:sensorId/toggle', authMiddleware, async (req, res) => {
    try {
        const { sensorId } = req.params;

        const settings = await Settings.findOne({ userId: req.userId });
        if (!settings) {
            return res.status(404).json({
                success: false,
                message: 'No sensors found'
            });
        }

        const sensor = settings.sensors.find(s => s.id === sensorId);
        if (!sensor) {
            return res.status(404).json({
                success: false,
                message: 'Sensor not found'
            });
        }

        sensor.enabled = !sensor.enabled;
        await settings.save();

        res.json({
            success: true,
            message: `Sensor ${sensor.enabled ? 'enabled' : 'disabled'}`,
            sensor
        });
    } catch (error) {
        console.error('Toggle Sensor Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error toggling sensor'
        });
    }
});

module.exports = router;
