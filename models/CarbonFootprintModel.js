var mongoose = require('mongoose');

var CarbonFootprintSchema = new mongoose.Schema({
    user: String,
    location: String,
    totalCO2: String,
    travelCO2: String,
    foodCO2: String,
    homeCO2: String,
    updated_date: { type: Date, default: Date.now },
  });

  module.exports = mongoose.model('CarbonFootprint', CarbonFootprintSchema);