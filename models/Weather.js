const mongoose = require('mongoose');

const weatherSchema = new mongoose.Schema({
    time: Date,
    temperature2m: Number,
    apparentTemperature: Number,
    precipitationProbability: Number,
    precipitation: Number,
    rain: Number
});

module.exports = mongoose.model('Weather', weatherSchema)