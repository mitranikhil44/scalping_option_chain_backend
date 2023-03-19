const mongoose = require("mongoose");

// Suppress the warning by setting strictQuery to true
mongoose.set("strictQuery", true);

// Define the NiftyData schema
const NiftyDataSchema = new mongoose.Schema({
  date: { type: String, required: true },
  TotalCallLTP: { type: Number, required: true },
  TotalCallChgLTP: { type: Number, required: true },
  TotalCallVol: { type: Number, required: true },
  TotalCallOI: { type: Number, required: true },
  TotalCallChgOI: { type: Number, required: true },
  TotalPutLTP: { type: Number, required: true },
  TotalPutChgLTP: { type: Number, required: true },
  TotalPutVol: { type: Number, required: true },
  TotalPutOI: { type: Number, required: true },
  TotalPutChgOI: { type: Number, required: true },
  liveMarketPrice: { type: Number, required: true }
});

// Compile the schema into a model
module.exports = mongoose.model("NiftyData", NiftyDataSchema);
