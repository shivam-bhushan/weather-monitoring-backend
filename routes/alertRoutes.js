// routes/alertRoutes.js
const express = require('express');
const router = express.Router();
const Alert = require('../models/Alerts');
const verifyToken = require('../middleware/verifyToken');

// Route to get all alerts
router.get('/', async (req, res) => {
    try {
        console.log('Fetching alerts...');
        // const userId = req.user.id; // Assume verifyToken middleware adds user to request

        // if (!userId) {
        //     console.log('UserId is required');
        //     return res.status(400).json({ message: 'UserId is required' });
        // }

        const alerts = await Alert.find().sort({ timestamp: -1 });
        console.log('Alerts:', alerts);
        res.json(alerts);
    } catch (error) {
        console.error('Error retrieving alerts:', error);
        res.status(500).json({ message: 'Error retrieving alerts', error: error.message });
    }
});

module.exports = router;
