require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Connect to MongoDB
connectDB();

// Import routes
const authRoutes = require('./routes/auth');
const sensorRoutes = require('./routes/sensors');
const advisoryRoutes = require('./routes/advisory');
const alertRoutes = require('./routes/alerts');
const predictionRoutes = require('./routes/prediction');
const settingsRoutes = require('./routes/settings');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/sensors', sensorRoutes);
app.use('/api/advisory', advisoryRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/prediction', predictionRoutes);
app.use('/api/settings', settingsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Namma Farm server is running',
        timestamp: new Date().toISOString()
    });
});

// Serve HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/signup.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

app.get('/settings', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/settings.html'));
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('\n========================================');
    console.log('🌾 NAMMA FARM SERVER STARTED 🌾');
    console.log('========================================');
    console.log(`✓ Server running on port ${PORT}`);
    console.log(`✓ Local: http://localhost:${PORT}`);
    console.log(`✓ Network: http://192.168.x.x:${PORT}`);
    console.log('========================================');
    console.log('📡 API Endpoints:');
    console.log('  - POST /api/auth/signup');
    console.log('  - POST /api/auth/login');
    console.log('  - GET  /api/sensors/latest');
    console.log('  - POST /api/sensors/data (IoT webhook)');
    console.log('  - GET  /api/advisory/weather');
    console.log('  - GET  /api/advisory/soil');
    console.log('  - GET  /api/alerts/fire');
    console.log('  - POST /api/prediction/yield');
    console.log('========================================\n');
});

module.exports = app;
