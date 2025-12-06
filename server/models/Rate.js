const mongoose = require("mongoose");

const rateSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true }, // USD, EUR
  currency: { type: String, required: true },           // full name
  mid: { type: Number, required: true },                // PLN per unit
});

module.exports = mongoose.model("Rate", rateSchema);
