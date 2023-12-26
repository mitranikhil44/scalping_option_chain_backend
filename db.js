const mongoose = require("mongoose");
const mongoURL = "mongodb://darksquadyt35:Babul%40123%4033@ac-i2emmmf-shard-00-00.iresf3t.mongodb.net:27017/option-chain-data?ssl=true&replicaSet=atlas-19rcsa-shard-0&authSource=admin&retryWrites=true&w=majority";

const connectToMongo = async () => {
  try {
    await mongoose.connect(mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB successfully");
  } catch (err) {
    console.error(err);
  }
};

module.exports = connectToMongo;
