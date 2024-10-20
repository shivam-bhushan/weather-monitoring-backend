
// index.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const cors = require('cors');
const axios = require('axios')

const verifyToken = require('./middleware/verifyToken');
const weatherRoutes = require('./routes/weatherRoutes');
const alertRoutes = require('./routes/alertRoutes');
const { performDailyRollup, monitorAlerts, fetchAndStoreWeatherData } = require('./services/weatherServices');

const app = express();
const port = process.env.PORT || 3004;

// Enable CORS
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log('Connected to MongoDB');
});

// Routes
app.use('/weather', weatherRoutes);
app.use('/alerts', alertRoutes); // Add alert route


// Fetch and store weather data every hour for a default location (e.g., Berlin)
setInterval(() => fetchAndStoreWeatherData(52.52, 13.41), 3600000);

// Added scheduling for daily rollup and alert monitoring
setInterval(performDailyRollup, 86400000); // Run daily rollup every 24 hours
setInterval(monitorAlerts, 3600000); // Run alert monitoring every hour

// Initial fetch when starting the server
fetchAndStoreWeatherData(52.52, 13.41);
performDailyRollup(); // Initial daily rollup
monitorAlerts(); // Initial alert monitoring

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
