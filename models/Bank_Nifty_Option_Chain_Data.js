const mongoose = require("mongoose");

// Suppress the warning by setting strictQuery to true
mongoose.set('strictQuery', true);

// Define the NiftyData schema
const BankNiftyOptionSchema = new mongoose.Schema({
    CallLTP : String,
    CallChgLTP : String,
    CallVol : String,
    CallOI : String,
    CallChgOI : String,
    StrikePrice : String,
    PutLTP : String,
    PutChgLTP : String,
    PutVol : String,
    PutOI : String,
    PutChgOI : String
  });
  
  // Compile the schema into a model
  module.exports = mongoose.model("BankNiftyOptionData", BankNiftyOptionSchema);