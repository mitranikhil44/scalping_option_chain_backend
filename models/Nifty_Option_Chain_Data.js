const mongoose = require("mongoose");

// Suppress the warning by setting strictQuery to true
mongoose.set('strictQuery', true);

// Define the NiftyData schema
const NiftyOptionSchema = new mongoose.Schema({
    CallLTP : { type: String, required: true},
    CallChgLTP : { type: String, required: true},
    CallVol : { type: String, required: true},
    CallOI : { type: String, required: true},
    CallChgOI : { type: String, required: true},
    StrikePrice : { type: String, required: true},
    PutLTP : { type: String, required: true},
    PutChgLTP : { type: String, required: true},
    PutVol : { type: String, required: true},
    PutOI : { type: String, required: true},
    PutChgOI : { type: String, required: true}
  });
  
  // Compile the schema into a model
  module.exports = mongoose.model("NiftyOptionData", NiftyOptionSchema);