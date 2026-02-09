const SensorData = require('../models/SensorData');
const Settings = require('../models/Settings');
const weatherService = require('./weatherService');

class SensorService {
    /**
     * PRIORITY LOGIC: Get sensor data with fallback to online data
     * 1. Try real-time sensor data first
     * 2. If unavailable or old, use online data
     */
    async getSensorData(userId, type) {
        try {
            // Check if user has fallback enabled
            const settings = await Settings.findOne({ userId });
            const useFallback = settings ? settings.useFallback : true;

            // 1. Try to get latest sensor data
            const sensorData = await this.getLatestSensorData(userId, type);

            // Check if sensor data is recent (within last 5 minutes)
            if (sensorData && this.isRecent(sensorData.timestamp)) {
                return {
                    data: sensorData.value,
                    source: 'sensor',
                    timestamp: sensorData.timestamp,
                    sensorId: sensorData.sensorId
                };
            }

            // 2. Fallback to online data if enabled
            if (useFallback) {
                const onlineData = await this.getOnlineData(userId, type);
                return {
                    data: onlineData,
                    source: 'online',
                    timestamp: new Date(),
                    sensorId: 'online-fallback'
                };
            }

            // 3. No data available
            return {
                data: null,
                source: 'none',
                timestamp: new Date(),
                error: 'No sensor data available and fallback disabled'
            };

        } catch (error) {
            console.error('Sensor Service Error:', error.message);
            return {
                data: null,
                source: 'error',
                timestamp: new Date(),
                error: error.message
            };
        }
    }

    /**
     * Get latest sensor reading from database
     */
    async getLatestSensorData(userId, type) {
        return await SensorData.findOne({ userId, type, source: 'sensor' })
            .sort({ timestamp: -1 })
            .limit(1);
    }

    /**
     * Check if timestamp is recent (within 5 minutes)
     */
    isRecent(timestamp) {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        return new Date(timestamp) > fiveMinutesAgo;
    }

    /**
     * Get online fallback data based on type
     */
    async getOnlineData(userId, type) {
        const User = require('../models/User');
        const user = await User.findById(userId);
        const location = user?.location || 'Chennai'; // Default location

        const weather = await weatherService.getCurrentWeather(location);

        switch (type) {
            case 'moisture':
                return weatherService.estimateSoilMoisture(weather);

            case 'temperature':
                return weather.temperature;

            case 'fire':
                return 0; // No fire detected (default safe state)

            case 'nutrition':
                return {
                    nitrogen: 45,
                    phosphorus: 25,
                    potassium: 35,
                    note: 'Estimated values - sensor data recommended'
                };

            default:
                return null;
        }
    }

    /**
     * Save sensor data from IoT device
     */
    async saveSensorData(data) {
        const sensorData = new SensorData({
            userId: data.userId,
            sensorId: data.sensorId,
            type: data.type,
            value: data.value,
            source: 'sensor',
            timestamp: data.timestamp || new Date()
        });

        await sensorData.save();
        return sensorData;
    }

    /**
     * Check for fire alerts (critical priority)
     */
    async checkFireAlert(userId) {
        const fireData = await this.getSensorData(userId, 'fire');

        // Fire detected if value > 0 (digital sensor) or > threshold (analog)
        const isFireDetected = fireData.data > 0;

        return {
            alert: isFireDetected,
            level: isFireDetected ? 'CRITICAL' : 'SAFE',
            value: fireData.data,
            source: fireData.source,
            timestamp: fireData.timestamp,
            message: isFireDetected
                ? 'Fire/Smoke detected! Take immediate action!'
                : 'No fire detected. All clear.'
        };
    }

    /**
     * Get all sensor readings for dashboard
     */
    async getAllSensorData(userId) {
        const [moisture, nutrition, fire, temperature] = await Promise.all([
            this.getSensorData(userId, 'moisture'),
            this.getSensorData(userId, 'nutrition'),
            this.getSensorData(userId, 'fire'),
            this.getSensorData(userId, 'temperature')
        ]);

        return {
            moisture,
            nutrition,
            fire,
            temperature
        };
    }
}

module.exports = new SensorService();
