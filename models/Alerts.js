// models/Alert.js
const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    message: String,
    timestamp: Date,
    city: String,
});

module.exports = mongoose.model('Alert', alertSchema);
