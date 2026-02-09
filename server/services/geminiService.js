const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class GeminiService {
    constructor() {
        this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    }

    /**
     * Generate weather-based crop advisory
     */
    async generateCropAdvisory(weatherData, cropType, language = 'en') {
        const prompt = language === 'ta'
            ? `நீங்கள் ஒரு விவசாய நிபுணர். பின்வரும் வானிலை தரவு மற்றும் பயிர் வகைக்கு எளிய, நடைமுறை ஆலோசனை வழங்கவும்.

வானிலை:
- வெப்பநிலை: ${weatherData.temperature}°C
- ஈரப்பதம்: ${weatherData.humidity}%
- மழை: ${weatherData.rainfall}mm
- நிலை: ${weatherData.condition}

பயிர்: ${cropType || 'பொதுவான பயிர்கள்'}

தயவுசெய்து வழங்கவும்:
1. உடனடி நடவடிக்கைகள் (இன்று என்ன செய்ய வேண்டும்)
2. தவிர்க்க வேண்டியவை (என்ன செய்யக்கூடாது)
3. தடுப்பு நடவடிக்கைகள் (எதிர்காலத்திற்கு)

எளிய தமிழில், விவசாயிகளுக்கு புரியும் வகையில் பதிலளிக்கவும்.`
            : `You are an agricultural expert. Provide simple, practical advice for the following weather data and crop type.

Weather:
- Temperature: ${weatherData.temperature}°C
- Humidity: ${weatherData.humidity}%
- Rainfall: ${weatherData.rainfall}mm
- Condition: ${weatherData.condition}

Crop: ${cropType || 'General crops'}

Please provide:
1. Immediate Actions (what to do today)
2. Things to Avoid (what NOT to do)
3. Preventive Measures (for future protection)

Keep language simple and farmer-friendly.`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Gemini API Error:', error.message);
            return this.getFallbackAdvisory(weatherData, language);
        }
    }

    /**
     * Analyze soil health and provide recommendations
     */
    async analyzeSoilHealth(soilData, cropType, language = 'en') {
        const prompt = language === 'ta'
            ? `நீங்கள் மண் ஆரோக்கிய நிபுணர். பின்வரும் மண் தரவை பகுப்பாய்வு செய்து பரிந்துரைகள் வழங்கவும்.

மண் தரவு:
- ஈரப்பதம்: ${soilData.moisture}%
${soilData.nitrogen ? `- நைட்ரஜன்: ${soilData.nitrogen} mg/kg` : ''}
${soilData.phosphorus ? `- பாஸ்பரஸ்: ${soilData.phosphorus} mg/kg` : ''}
${soilData.potassium ? `- பொட்டாசியம்: ${soilData.potassium} mg/kg` : ''}

பயிர்: ${cropType || 'பொதுவான பயிர்கள்'}

தயவுசெய்து வழங்கவும்:
1. மண் ஆரோக்கிய நிலை (நல்லது/சராசரி/மோசம்)
2. உரப் பரிந்துரைகள் (என்ன உரம், எவ்வளவு)
3. நீர்ப்பாசன வழிகாட்டுதல் (எப்போது, எவ்வளவு)

எளிய தமிழில் பதிலளிக்கவும்.`
            : `You are a soil health expert. Analyze the following soil data and provide recommendations.

Soil Data:
- Moisture: ${soilData.moisture}%
${soilData.nitrogen ? `- Nitrogen: ${soilData.nitrogen} mg/kg` : ''}
${soilData.phosphorus ? `- Phosphorus: ${soilData.phosphorus} mg/kg` : ''}
${soilData.potassium ? `- Potassium: ${soilData.potassium} mg/kg` : ''}

Crop: ${cropType || 'General crops'}

Please provide:
1. Soil Health Status (Good/Average/Poor)
2. Fertilizer Recommendations (what type, how much)
3. Irrigation Guidance (when, how much)

Keep language simple and practical.`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Gemini API Error:', error.message);
            return this.getFallbackSoilAdvice(soilData, language);
        }
    }

    /**
     * Predict crop yield based on multiple factors
     */
    async predictYield(data, language = 'en') {
        const { weather, soil, cropType, area } = data;

        const prompt = language === 'ta'
            ? `நீங்கள் பயிர் விளைச்சல் கணிப்பு நிபுணர். பின்வரும் தரவுகளின் அடிப்படையில் விளைச்சலை கணிக்கவும்.

பயிர்: ${cropType}
பரப்பளவு: ${area} ஏக்கர்

வானிலை:
- வெப்பநிலை: ${weather.temperature}°C
- மழை: ${weather.rainfall}mm

மண்:
- ஈரப்பதம்: ${soil.moisture}%

தயவுசெய்து வழங்கவும்:
1. எதிர்பார்க்கப்படும் விளைச்சல் (கிலோ/ஏக்கர்)
2. விளைச்சலை மேம்படுத்த வழிகள்
3. குறிப்பிட்ட பரிந்துரைகள்

எளிய தமிழில் பதிலளிக்கவும்.`
            : `You are a crop yield prediction expert. Predict yield based on the following data.

Crop: ${cropType}
Area: ${area} acres

Weather:
- Temperature: ${weather.temperature}°C
- Rainfall: ${weather.rainfall}mm

Soil:
- Moisture: ${soil.moisture}%

Please provide:
1. Expected Yield (kg/acre)
2. Ways to Improve Yield
3. Specific Recommendations

Keep language simple and actionable.`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Gemini API Error:', error.message);
            return this.getFallbackYieldPrediction(data, language);
        }
    }

    // Fallback responses when API fails
    getFallbackAdvisory(weatherData, language) {
        if (language === 'ta') {
            return `வானிலை நிலை: ${weatherData.condition}\n\nஉடனடி நடவடிக்கைகள்:\n- வயலை சரிபார்க்கவும்\n- நீர்ப்பாசன அளவை சரிசெய்யவும்\n\nதவிர்க்க வேண்டியவை:\n- அதிக நீர் பாய்ச்சுதல்\n\nதடுப்பு நடவடிக்கைகள்:\n- வானிலை முன்னறிவிப்பை தொடர்ந்து கண்காணிக்கவும்`;
        }
        return `Weather Condition: ${weatherData.condition}\n\nImmediate Actions:\n- Check your field\n- Adjust irrigation\n\nThings to Avoid:\n- Over-watering\n\nPreventive Measures:\n- Monitor weather forecasts regularly`;
    }

    getFallbackSoilAdvice(soilData, language) {
        if (language === 'ta') {
            return `மண் ஈரப்பதம்: ${soilData.moisture}%\n\nநிலை: ${soilData.moisture > 60 ? 'நல்லது' : soilData.moisture > 30 ? 'சராசரி' : 'குறைவு'}\n\nபரிந்துரை: ${soilData.moisture < 30 ? 'நீர்ப்பாசனம் தேவை' : 'தற்போதைய நிலையை பராமரிக்கவும்'}`;
        }
        return `Soil Moisture: ${soilData.moisture}%\n\nStatus: ${soilData.moisture > 60 ? 'Good' : soilData.moisture > 30 ? 'Average' : 'Low'}\n\nRecommendation: ${soilData.moisture < 30 ? 'Irrigation needed' : 'Maintain current levels'}`;
    }

    getFallbackYieldPrediction(data, language) {
        if (language === 'ta') {
            return `பயிர்: ${data.cropType}\n\nதோராயமான விளைச்சல்: கணக்கிடப்படுகிறது\n\nபரிந்துரை: மண் மற்றும் வானிலை நிலைமைகளை தொடர்ந்து கண்காணிக்கவும்`;
        }
        return `Crop: ${data.cropType}\n\nEstimated Yield: Calculating...\n\nRecommendation: Continue monitoring soil and weather conditions`;
    }
}

module.exports = new GeminiService();
