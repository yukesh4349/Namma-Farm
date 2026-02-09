const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Settings = require('../models/Settings');

/**
 * GET /api/settings
 * Get user settings
 */
router.get('/', authMiddleware, async (req, res) => {
    try {
        let settings = await Settings.findOne({ userId: req.userId });

        if (!settings) {
            // Create default settings
            settings = new Settings({
                userId: req.userId,
                sensors: [],
                useFallback: true
            });
            await settings.save();
        }

        res.json({
            success: true,
            settings
        });
    } catch (error) {
        console.error('Get Settings Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching settings'
        });
    }
});

/**
 * PUT /api/settings
 * Update settings
 */
router.put('/', authMiddleware, async (req, res) => {
    try {
        const { useFallback } = req.body;

        let settings = await Settings.findOne({ userId: req.userId });

        if (!settings) {
            settings = new Settings({ userId: req.userId });
        }

        if (useFallback !== undefined) {
            settings.useFallback = useFallback;
        }

        settings.updatedAt = new Date();
        await settings.save();

        res.json({
            success: true,
            message: 'Settings updated successfully',
            settings
        });
    } catch (error) {
        console.error('Update Settings Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating settings'
        });
    }
});

module.exports = router;
