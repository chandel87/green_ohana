var mongoose = require('mongoose');

var WellbeingSchema = new mongoose.Schema({
    name: String,
    indicator: String,
    description: String,
    updated_date: { type: Date, default: Date.now },
  });

  module.exports = mongoose.model('Wellbeing', WellbeingSchema);