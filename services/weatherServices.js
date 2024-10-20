const axios = require('axios');
const Weather = require('../models/Weather');
const Alert = require('../models/Alerts');

// Function to fetch and store weather data for given coordinates
async function fetchAndStoreWeatherData(latitude, longitude) {
    const params = {
        "latitude": latitude,
        "longitude": longitude,
        "hourly": ["temperature_2m", "apparent_temperature", "precipitation_probability", "precipitation", "rain"]
    };
    const url = "https://api.open-meteo.com/v1/forecast";

    try {
        const response = await axios.get(url, { params });
        const hourly = response.data.hourly;

        const weatherData = {
            time: hourly.time.map((t) => new Date(t).toISOString()),
            temperature2m: hourly.temperature_2m,
            apparentTemperature: hourly.apparent_temperature,
            precipitationProbability: hourly.precipitation_probability,
            precipitation: hourly.precipitation,
            rain: hourly.rain
        };

        // Store data in MongoDB
        for (let i = 0; i < weatherData.time.length; i++) {
            const weatherEntry = new Weather({
                time: weatherData.time[i],
                temperature2m: weatherData.temperature2m[i],
                apparentTemperature: weatherData.apparentTemperature[i],
                precipitationProbability: weatherData.precipitationProbability[i],
                precipitation: weatherData.precipitation[i],
                rain: weatherData.rain[i]
            });
            await weatherEntry.save();
        }
        console.log('Weather data stored successfully');
    } catch (error) {
        console.error('Error fetching or storing weather data:', error);
    }
}

// Function to get weather data for specific coordinates
async function getWeatherData(latitude, longitude) {
    const params = {
        "latitude": parseFloat(latitude),
        "longitude": parseFloat(longitude),
        "hourly": ["temperature_2m", "apparent_temperature", "precipitation_probability", "precipitation", "rain"]
    };
    const url = "https://api.open-meteo.com/v1/forecast";

    const response = await axios.get(url, { params });
    const hourly = response.data.hourly;

    return {
        time: hourly.time.map((t) => new Date(t).toISOString()),
        temperature2m: hourly.temperature_2m,
        apparentTemperature: hourly.apparent_temperature,
        precipitationProbability: hourly.precipitation_probability,
        precipitation: hourly.precipitation,
        rain: hourly.rain
    };
}

// Function to calculate daily rollup and aggregates
async function performDailyRollup() {
    try {
        const weatherData = await Weather.find();
        const dailyData = {};

        // Aggregate weather data by day
        weatherData.forEach(entry => {
            const day = entry.time.toISOString().split('T')[0];
            if (!dailyData[day]) {
                dailyData[day] = {
                    totalTemp: 0,
                    maxTemp: entry.temperature2m,
                    minTemp: entry.temperature2m,
                    count: 0,
                    conditions: {}
                };
            }
            dailyData[day].totalTemp += entry.temperature2m;
            dailyData[day].maxTemp = Math.max(dailyData[day].maxTemp, entry.temperature2m);
            dailyData[day].minTemp = Math.min(dailyData[day].minTemp, entry.temperature2m);
            dailyData[day].count++;

            // Track weather condition frequency
            const condition = entry.precipitation > 0 ? 'Precipitation' : 'Clear';
            dailyData[day].conditions[condition] = (dailyData[day].conditions[condition] || 0) + 1;
        });

        // Calculate and log daily summaries
        Object.keys(dailyData).forEach(day => {
            const avgTemp = dailyData[day].totalTemp / dailyData[day].count;
            const dominantCondition = Object.keys(dailyData[day].conditions).reduce((a, b) =>
                dailyData[day].conditions[a] > dailyData[day].conditions[b] ? a : b
            );
            console.log(`Date: ${day}, Avg Temp: ${avgTemp.toFixed(2)}°C, Max Temp: ${dailyData[day].maxTemp}°C, Min Temp: ${dailyData[day].minTemp}°C, Dominant Condition: ${dominantCondition}`);
        });
    } catch (error) {
        console.error('Error performing daily rollup:', error);
    }
}

// Function to monitor alerts based on temperature thresholds
async function monitorAlerts() {
    const alertThreshold = 0; // Set threshold to 0 to ensure an alert is triggered for testing purposes
    try {
        const recentWeatherData = await Weather.find().sort({ time: -1 }).limit(2);
        if (recentWeatherData.length >= 2) {
            console.log('Fetched recent weather data for alerts:', recentWeatherData);
            const [latest, previous] = recentWeatherData;
            if (latest.temperature2m > alertThreshold && previous.temperature2m > alertThreshold) {
                const alertMessage = `ALERT: Temperature exceeded ${alertThreshold}°C for two consecutive updates at ${latest.time}`;
                console.log(alertMessage);

                // Save alert to the database
                const alert = new Alert({
                    message: alertMessage,
                    timestamp: new Date(),
                    city: "Berlin" // Set appropriate city or make it dynamic based on data
                });
                await alert.save();
            } else {
                console.log('No alert triggered. Latest temperatures:', latest.temperature2m, previous.temperature2m);
            }
        } else {
            console.log('Not enough data to evaluate alerts.');
        }
    } catch (error) {
        console.error('Error monitoring alerts:', error);
    }
}

module.exports = {
    fetchAndStoreWeatherData,
    getWeatherData,
    performDailyRollup,
    monitorAlerts
};
