// routes/weatherRoutes.js
const express = require('express');
const router = express.Router();
const { getWeatherData } = require('../services/weatherServices');

// Route to get weather data for a specific city based on coordinates
router.get('/', async (req, res) => {
    try {
        const { latitude, longitude } = req.query;

        if (!latitude || !longitude) {
            return res.status(400).json({ message: 'Latitude and longitude are required' });
        }

        const weatherData = await getWeatherData(latitude, longitude);
        res.json(weatherData);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving weather data', error: error.message });
    }
});

module.exports = router;