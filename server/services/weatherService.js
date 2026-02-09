const axios = require('axios');

class WeatherService {
    constructor() {
        this.apiKey = process.env.WEATHER_API_KEY;
        this.baseUrl = 'https://api.openweathermap.org/data/2.5';
    }

    /**
     * Get current weather by location (city name or coordinates)
     */
    async getCurrentWeather(location) {
        try {
            const url = `${this.baseUrl}/weather?q=${location}&appid=${this.apiKey}&units=metric`;
            const response = await axios.get(url);

            return {
                temperature: Math.round(response.data.main.temp),
                humidity: response.data.main.humidity,
                condition: response.data.weather[0].main,
                description: response.data.weather[0].description,
                rainfall: response.data.rain ? response.data.rain['1h'] || 0 : 0,
                windSpeed: response.data.wind.speed,
                pressure: response.data.main.pressure,
                location: response.data.name
            };
        } catch (error) {
            console.error('Weather API Error:', error.message);

            // Return fallback data
            return {
                temperature: 28,
                humidity: 65,
                condition: 'Clear',
                description: 'clear sky',
                rainfall: 0,
                windSpeed: 3.5,
                pressure: 1013,
                location: location,
                error: 'Using estimated data - API unavailable'
            };
        }
    }

    /**
     * Get weather forecast for next 5 days
     */
    async getForecast(location) {
        try {
            const url = `${this.baseUrl}/forecast?q=${location}&appid=${this.apiKey}&units=metric`;
            const response = await axios.get(url);

            // Group by day and get daily summary
            const dailyData = {};
            response.data.list.forEach(item => {
                const date = item.dt_txt.split(' ')[0];
                if (!dailyData[date]) {
                    dailyData[date] = {
                        date: date,
                        temp: item.main.temp,
                        condition: item.weather[0].main,
                        rainfall: item.rain ? item.rain['3h'] || 0 : 0
                    };
                }
            });

            return Object.values(dailyData).slice(0, 5);
        } catch (error) {
            console.error('Forecast API Error:', error.message);
            return [];
        }
    }

    /**
     * Estimate soil moisture based on rainfall (fallback when sensor unavailable)
     */
    estimateSoilMoisture(weatherData) {
        const { rainfall, humidity, temperature } = weatherData;

        // Simple estimation algorithm
        let moisture = 40; // Base moisture

        if (rainfall > 10) moisture += 30;
        else if (rainfall > 5) moisture += 20;
        else if (rainfall > 0) moisture += 10;

        if (humidity > 70) moisture += 10;
        else if (humidity < 40) moisture -= 10;

        if (temperature > 35) moisture -= 15;
        else if (temperature < 20) moisture += 5;

        return Math.max(10, Math.min(100, moisture));
    }
}

module.exports = new WeatherService();
