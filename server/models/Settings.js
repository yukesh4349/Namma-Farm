const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    sensors: [{
        id: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ['moisture', 'nutrition', 'fire', 'temperature'],
            required: true
        },
        name: {
            type: String,
            required: true
        },
        enabled: {
            type: Boolean,
            default: true
        }
    }],
    useFallback: {
        type: Boolean,
        default: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Settings', settingsSchema);
