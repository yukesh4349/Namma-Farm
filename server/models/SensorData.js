const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sensorId: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['moisture', 'nutrition', 'fire', 'temperature'],
        required: true
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    source: {
        type: String,
        enum: ['sensor', 'online'],
        default: 'sensor'
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
sensorDataSchema.index({ userId: 1, type: 1, timestamp: -1 });

module.exports = mongoose.model('SensorData', sensorDataSchema);
