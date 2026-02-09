# Namma Farm - Smart Agricultural Platform

A production-ready, full-stack web application providing AI-powered agricultural assistance for farmers with real-time IoT sensor integration, weather advisories, soil monitoring, fire alerts, and crop yield predictions.

## 🌾 Features

- **Weather-Based Crop Advisory**: Real-time weather monitoring with AI-generated farming recommendations
- **Soil Health Monitoring**: Track soil moisture and NPK nutrition levels with smart irrigation guidance
- **Fire Alert System**: 24/7 fire and smoke detection with instant voice warnings
- **AI Crop Yield Prediction**: Predict harvest outcomes using weather, soil, and historical data
- **Multilingual Support**: Full Tamil and English language support
- **Voice Assistant**: Text-to-speech for alerts and advisories
- **IoT Sensor Integration**: Priority-based data handling (sensor-first, online fallback)
- **Mobile-First Design**: Responsive UI optimized for all devices

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (local or MongoDB Atlas)
- **Google Gemini API Key** ([Get it here](https://makersuite.google.com/app/apikey))
- **OpenWeatherMap API Key** ([Get it here](https://openweathermap.org/api) - Free tier available)

### Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd "d:\hackathon\eshwer hack\Namma Farm"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/namma-farm
   JWT_SECRET=your-super-secret-jwt-key-change-this
   GEMINI_API_KEY=your-gemini-api-key-here
   WEATHER_API_KEY=your-openweathermap-api-key-here
   SESSION_SECRET=your-session-secret
   ```

4. **Start MongoDB** (if using local installation)
   ```bash
   mongod
   ```

5. **Start the server**
   ```bash
   npm start
   ```

6. **Access the application**
   
   Open your browser and navigate to:
   - Local: `http://localhost:3000`
   - Network: `http://YOUR_IP:3000` (for mobile/IoT devices)

## 📡 IoT Sensor Setup

### Required Sensors

1. **Soil Moisture Sensor** (Capacitive or YL-69)
2. **NPK Soil Nutrition Sensor** (RS485)
3. **MQ-2 Smoke/Fire Sensor**
4. **DHT22 Temperature/Humidity** (Optional)

### Hardware

- **NodeMCU ESP8266** or **ESP32** (recommended)
- WiFi connection
- 5V power supply

### Detailed Setup

See `SENSOR_SETUP.txt` for complete instructions on:
- Sensor connections
- WiFi configuration
- Sending data to the server
- Troubleshooting

### Quick Sensor Integration

Sensors send data via HTTP POST to:
```
POST http://YOUR_SERVER_IP:3000/api/sensors/data
Content-Type: application/json

{
  "userId": "your_user_id_from_settings",
  "sensorId": "SENSOR_001",
  "type": "moisture",
  "value": 65,
  "timestamp": "2026-01-07T19:00:00Z"
}
```

## 🔑 Getting API Keys

### Google Gemini API (Free)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key and add to `.env` file

### OpenWeatherMap API (Free Tier)

1. Sign up at [OpenWeatherMap](https://openweathermap.org/api)
2. Go to "API Keys" section
3. Copy your key and add to `.env` file
4. Free tier: 1000 calls/day (sufficient for this app)

## 📱 Usage

### 1. Create Account

- Navigate to the landing page
- Click "Sign Up"
- Enter your details (name, phone, location, crop type)
- Choose preferred language (Tamil/English)

### 2. Register Sensors

- Login to your account
- Go to Settings page
- Click "Add New Sensor"
- Enter Sensor ID, Type, and Name
- Copy your User ID for sensor configuration

### 3. Monitor Dashboard

- View real-time weather and crop advisories
- Check soil moisture and nutrition levels
- Monitor fire alert status
- Get AI-powered yield predictions

### 4. Voice Assistant

- Click the speaker icon to enable voice alerts
- Receive spoken warnings for fire detection
- Hear advisories in your preferred language

## 🏗️ Project Structure

```
namma-farm/
├── server/
│   ├── server.js              # Main Express server
│   ├── config/db.js           # MongoDB connection
│   ├── models/                # Mongoose schemas
│   ├── routes/                # API endpoints
│   ├── services/              # Business logic
│   └── middleware/            # Auth middleware
├── public/
│   ├── index.html             # Landing page
│   ├── login.html             # Login page
│   ├── signup.html            # Signup page
│   ├── dashboard.html         # Main dashboard
│   ├── settings.html          # Settings page
│   ├── css/                   # Stylesheets
│   └── js/                    # Client-side JavaScript
├── .env                       # Environment variables
├── package.json               # Dependencies
├── SENSOR_SETUP.txt           # Sensor setup guide
└── README.md                  # This file
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Sensors
- `POST /api/sensors/data` - Receive sensor data (IoT webhook)
- `GET /api/sensors/latest` - Get latest readings
- `POST /api/sensors/register` - Register new sensor

### Advisory
- `GET /api/advisory/weather` - Weather-based crop advice
- `GET /api/advisory/soil` - Soil health analysis

### Alerts
- `GET /api/alerts/fire` - Fire alert status
- `GET /api/alerts/all` - All alerts

### Prediction
- `POST /api/prediction/yield` - Crop yield prediction

## 🌐 Deployment

### Local Network Access

To access from other devices on your network:

1. Find your computer's IP address:
   ```bash
   ipconfig
   ```

2. Access from mobile/IoT devices:
   ```
   http://YOUR_IP:3000
   ```

### Production Deployment

For production deployment, consider:
- Using MongoDB Atlas (cloud database)
- Setting up HTTPS with SSL certificates
- Using a process manager like PM2
- Deploying to cloud platforms (Heroku, AWS, DigitalOcean)

## 🛠️ Troubleshooting

### Server won't start
- Check if MongoDB is running
- Verify all environment variables are set
- Check if port 3000 is available

### Sensors not sending data
- Verify WiFi connection on IoT device
- Check server URL in sensor code
- Ensure User ID matches your account
- Check sensor is registered in Settings

### No weather data
- Verify OpenWeatherMap API key is valid
- Check internet connection
- Ensure location is set in user profile

### Fire alerts not working
- Check smoke sensor connections
- Verify sensor data is being received
- Enable voice assistant for audio warnings

## 📄 License

MIT License - Free to use for personal and commercial projects

## 🤝 Support

For technical assistance:
- Check `SENSOR_SETUP.txt` for sensor issues
- Review API documentation in code comments
- Check browser console for errors

## 🎯 Future Enhancements

- Mobile app (Android/iOS)
- Historical data analytics
- Multi-field management
- Community features
- Marketplace integration
- Advanced ML models

---

**Namma Farm** - Empowering farmers with AI and IoT technology 🌾
