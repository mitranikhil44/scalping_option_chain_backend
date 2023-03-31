const mongoose = require("mongoose");

// Suppress the warning by setting strictQuery to true
mongoose.set("strictQuery", true);

// Define the NiftyData schema
const MidCpNiftyOptionSchema = new mongoose.Schema({
  CallOI: String,
  CallChgOI: String,
  CallVol: String,
  CallChgLTP: String,
  CallLTP: String,
  StrikePrice: String,
  PutLTP: String,
  PutChgLTP: String,
  PutVol: String,
  PutChgOI: String,
  PutOI: String,
});

// Compile the schema into a model
module.exports = mongoose.model("MidCpNiftyOptionData", MidCpNiftyOptionSchema);