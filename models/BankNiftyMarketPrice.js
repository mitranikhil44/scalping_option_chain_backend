const mongoose = require("mongoose");

// Suppress the warning by setting strictQuery to true
mongoose.set('strictQuery', true);

// Define the NiftyData schema
const BankNiftyMarketPriceSchema = new mongoose.Schema({
  timestamp: String,
  price: Number,
  volume: Number
  });
  
  // Compile the schema into a model
  module.exports = mongoose.model("BankNiftyMarketPrice", BankNiftyMarketPriceSchema);