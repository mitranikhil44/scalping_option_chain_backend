const BankNiftyOptionData = require("./models/Bank_Nifty_Option_Chain_Data");
const FinNiftyOptionData = require("./models/Fin_Nifty_Option_Chain_Data");
const BankNiftyMarketPrice = require("./models/BankNiftyMarketPrice");
const FinNiftyMarketPrice = require("./models/FinNiftyMarketPrice");
const NiftyOptionData = require("./models/Nifty_Option_Chain_Data");
const NiftyMarketPrice = require("./models/NiftyMarketPrice");
const BankNiftyData = require("./models/Bank_Nifty_Data");
const fetchUser = require("./middleware/loginrequired");
const FinNiftyData = require("./models/Fin_Nifty_Data");
const NiftyData = require("./models/Nifty_Data");
const moment = require("moment-timezone");
const connectToMongo = require("./db");
const express = require("express");
const cheerio = require("cheerio");
const axios = require("axios");
const cors = require("cors");
const cron = require("cron");

// Connet to database
connectToMongo();

// Express specific stuff
const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

const handleDataRoute =
  (model, sortParams = { id: -1 }) =>
  async (req, res) => {
    try {
      const data = await model.find({}).sort(sortParams);
      res.json({ success: true, data: data });
    } catch (err) {
      res.status(500).json({ success: false, error: err });
    }
  };

// Default Route
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Generic Route Handler
app.use("/api/auth_user", require("./routes/Auth_User"));
// app.use("/api/fetch_data", require("./routes/Fetch_Data"));

// Nifty Data Route
app.post("/nifty", fetchUser, handleDataRoute(NiftyData));

// Bank Nifty Data Route
app.post("/bank_nifty", fetchUser, handleDataRoute(BankNiftyData));

// Fin Nifty Data Route
app.post("/fin_nifty", fetchUser, handleDataRoute(FinNiftyData));

// Nifty Option Chain Data Route
app.post("/nifty_option_chain", fetchUser, handleDataRoute(NiftyOptionData));

// Bank Nifty Option Chain Data Route
app.post(
  "/bank_nifty_option_chain",
  fetchUser,
  handleDataRoute(BankNiftyOptionData)
);

// Fin Nifty Option Chain Data Route
app.post(
  "/fin_nifty_option_chain",
  fetchUser,
  handleDataRoute(FinNiftyOptionData)
);

// Nifty Market Price Route
app.post("/nifty_market_price", fetchUser, handleDataRoute(NiftyMarketPrice));

// Bank Nifty Market Price Route
app.post(
  "/bank_nifty_market_price",
  fetchUser,
  handleDataRoute(BankNiftyMarketPrice)
);

// Fin Nifty Market Price Route
app.post(
  "/fin_nifty_market_price",
  fetchUser,
  handleDataRoute(FinNiftyMarketPrice)
);

const fetchMarketPrice = async (url) => {
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);
  const value = $("bdo").text().trim().substring(0, 9);
  return value === "-" ? 0 : parseFloat(value.replace(/,/g, ""));
};

// Scalped live nifty 50 market price
const getNiftyPrice = async () => {
  return fetchMarketPrice("https://in.investing.com/indices/s-p-cnx-nifty");
};

// Scalped live bank nifty market price
const getBankNiftyPrice = async () => {
  return fetchMarketPrice("https://in.investing.com/indices/bank-nifty");
};

// Scalped live fin nifty market price
const getFinNiftyPrice = async () => {
  return fetchMarketPrice(`https://in.investing.com/indices/cnx-finance`);
};

// Function to clear the database
const clearDatabase = async () => {
  try {
    await NiftyData.deleteMany({});
    await BankNiftyData.deleteMany({});
    await FinNiftyData.deleteMany({});
    await NiftyOptionData.deleteMany({});
    await BankNiftyOptionData.deleteMany({});
    await FinNiftyOptionData.deleteMany({});
    await NiftyMarketPrice.deleteMany({});
    await BankNiftyMarketPrice.deleteMany({});
    await FinNiftyMarketPrice.deleteMany({});
    await fetchNiftyOptionChainData();
    await fetchBankNiftyOptionChainData();
    await fetchFinNiftyOptionChainData();
    setTimeout(async () => {
      await fetchData();
    }, 10000);
    await setLivePrices();
  } catch (err) {
    console.error(err);
  }
};

// Schedule the function to run every day at 12:00am in Indian Standard Time
const dailyClearDatabaseJob = cron.job("0 0 * * *", async () => {
  await clearDatabase();
});

// Function to set live market price
const setLiveMarketPrice = async (marketPriceModel, getPriceFn) => {
  try {
    const livePrice = await getPriceFn();
    const marketData = await marketPriceModel
      .find()
      .sort({ _id: -1 })
      .limit(1)
      .exec();

    if (marketData.length === 0) {
      const newMarketData = {
        timestamp: new Date().toLocaleTimeString("en-US", {
          timeZone: "Asia/Kolkata",
        }),
        price: livePrice,
        volume: 0,
      };
      await marketPriceModel.create(newMarketData);
    } else {
      const lastMarketData = marketData[0];
      const newVolume = parseInt(livePrice) - parseInt(lastMarketData.price);
      const newMarketData = {
        timestamp: new Date().toLocaleTimeString("en-US", {
          timeZone: "Asia/Kolkata",
        }),
        price: livePrice,
        volume: newVolume,
      };
      await marketPriceModel.create(newMarketData);
    }
  } catch (err) {
    console.log(err);
  }
};

// Set live market prices for Nifty50, BankNifty and FinNifty
const setLivePrices = async () => {
  try {
    await setLiveMarketPrice(NiftyMarketPrice, getNiftyPrice);
    await setLiveMarketPrice(BankNiftyMarketPrice, getBankNiftyPrice);
    await setLiveMarketPrice(FinNiftyMarketPrice, getFinNiftyPrice);
  } catch (err) {
    console.log(err);
  }
};

// Function to fetch nifty and bank nifty data
const fetchData = async () => {
  const niftyResult = await NiftyOptionData.find({});
  const bankNiftyResult = await BankNiftyOptionData.find({});
  const finNiftyResult = await FinNiftyOptionData.find({});
  const [niftyPrice, bankNiftyPrice, finNiftyPrice] = await Promise.all([
    getNiftyPrice(),
    getBankNiftyPrice(),
    getFinNiftyPrice(),
  ]);
  const currentDate = new Date().toLocaleTimeString("en-US", {
    timeZone: "Asia/Kolkata",
    hour12: true,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const niftyData = calculateData(niftyResult, niftyPrice, currentDate);
  const bankNiftyData = calculateData(
    bankNiftyResult,
    bankNiftyPrice,
    currentDate
  );
  const finNiftyData = calculateData(
    finNiftyResult,
    finNiftyPrice,
    currentDate
  );

  // Insert data into NiftyData and BankNiftyData collections
  await Promise.all([
    NiftyData.insertMany(niftyData),
    BankNiftyData.insertMany(bankNiftyData),
    FinNiftyData.insertMany(finNiftyData),
  ]);
};

const calculateData = (result, price, currentDate) => {
  const data = {
    date: currentDate,
    TotalCallLTP: 0,
    TotalCallChgLTP: 0,
    TotalCallVol: 0,
    TotalCallOI: 0,
    TotalCallChgOI: 0,
    TotalPutLTP: 0,
    TotalPutChgLTP: 0,
    TotalPutVol: 0,
    TotalPutOI: 0,
    TotalPutChgOI: 0,
    liveMarketPrice: price,
  };

  result.forEach((item) => {
    data.TotalCallLTP +=
      item.CallLTP === "-" ? 0 : parseFloat(item.CallLTP.replace(/,/g, ""));
    data.TotalCallChgLTP +=
      item.CallChgLTP === "-"
        ? 0
        : parseFloat(item.CallChgLTP.replace(/,/g, ""));
    data.TotalCallVol +=
      item.CallVol === "-" ? 0 : parseFloat(item.CallVol.replace(/,/g, ""));
    data.TotalCallOI +=
      item.CallOI === "-" ? 0 : parseFloat(item.CallOI.replace(/,/g, ""));
    data.TotalCallChgOI +=
      item.CallChgOI === "-" ? 0 : parseFloat(item.CallChgOI.replace(/,/g, ""));
    data.TotalPutLTP +=
      item.PutLTP === "-" ? 0 : parseFloat(item.PutLTP.replace(/,/g, ""));
    data.TotalPutChgLTP +=
      item.PutChgLTP === "-" ? 0 : parseFloat(item.PutChgLTP.replace(/,/g, ""));
    data.TotalPutVol +=
      item.PutVol === "-" ? 0 : parseFloat(item.PutVol.replace(/,/g, ""));
    data.TotalPutOI +=
      item.PutOI === "-" ? 0 : parseFloat(item.PutOI.replace(/,/g, ""));
    data.TotalPutChgOI +=
      item.PutChgOI === "-" ? 0 : parseFloat(item.PutChgOI.replace(/,/g, ""));
  });

  return data;
};

// Function to fetch option chain data from the website
const fetchOptionChainData = async (url, dataModel) => {
  // Get expiry dates from the URL
  const expiryDate = await axios.get(url);
  const expiry = cheerio.load(expiryDate.data);
  const expiryD = [];
  const expiryDateString = expiry("#sel_exp_date");

  // Extract expiry dates from the dropdown menu and add to array
  expiryDateString.each((i, element) => {
    const cells = expiry(element).find("option");
    const expiry_date = cells.eq(0).attr("value").trim();
    expiryD.push(expiry_date);
  });

  // Make request to URL with expiry date appended to get option chain data
  const result = await axios.get(url + expiryD[0]);
  const $ = cheerio.load(result.data);

  // Extract data from the option chain table and add to array
  const tableRows = $(".table_optionchain table tbody tr");
  const tableData = tableRows
    .map((i, element) => {
      const cells = $(element).find("td");
      return {
        CallOI: cells.eq(0).text().trim(),
        CallChgOI: cells.eq(1).text().trim(),
        CallVol: cells.eq(2).text().trim(),
        CallChgLTP: cells.eq(3).text().trim(),
        CallLTP: cells.eq(4).text().trim(),
        StrikePrice: cells.eq(5).text().trim(),
        PutLTP: cells.eq(6).text().trim(),
        PutChgLTP: cells.eq(7).text().trim(),
        PutVol: cells.eq(8).text().trim(),
        PutChgOI: cells.eq(9).text().trim(),
        PutOI: cells.eq(10).text().trim(),
      };
    })
    .get();

  // Delete all data from collection
  await dataModel.deleteMany({});

  // Insert new data into the collection
  await dataModel.insertMany(tableData);
};

// Function to fetch nifty option chain data from the website
const fetchNiftyOptionChainData = async () => {
  await fetchOptionChainData(
    "https://www.moneycontrol.com/indices/fno/view-option-chain/NIFTY/",
    NiftyOptionData
  );
};

// Function to fetch bank nifty option chain data from the website
const fetchBankNiftyOptionChainData = async () => {
  await fetchOptionChainData(
    "https://www.moneycontrol.com/indices/fno/view-option-chain/BANKNIFTY/",
    BankNiftyOptionData
  );
};

// Function to fetch fin nifty option chain data from the website
const fetchFinNiftyOptionChainData = async () => {
  await fetchOptionChainData(
    "https://www.moneycontrol.com/indices/fno/view-option-chain/FINNIFTY/",
    FinNiftyOptionData
  );
};

// Function to fetch data during market hours
const fetchMarketData = async () => {
  const now = moment().tz("Asia/Kolkata");
  const isMarketOpen =
    now.day() >= 1 &&
    now.day() <= 5 &&
    now.isBetween(
      moment.tz("Asia/Kolkata").hour(9),
      moment.tz("Asia/Kolkata").hour(15).minute(30),
      "hour",
      "[]"
    );

  if (isMarketOpen) {
    await fetchNiftyOptionChainData();
    await fetchBankNiftyOptionChainData();
    await fetchFinNiftyOptionChainData();
    setTimeout(async () => {
      await fetchData();
    }, 10000);
  }
};

// Function to fetch live Volume
const updateLivePrice = async () => {
  const now = moment().tz("Asia/Kolkata");
  const isMarketOpen =
    now.day() >= 1 &&
    now.day() <= 5 &&
    now.isBetween(
      moment.tz("Asia/Kolkata").hour(9),
      moment.tz("Asia/Kolkata").hour(15).minute(30),
      "hour",
      "[]"
    );
  if (isMarketOpen) {
    await setLivePrices();
  }
};

const cronJob = cron.job("*/15 * * * *", async () => {
  try {
    await fetchMarketData();
    await updateLivePrice();
  } catch (error) {
    console.error("Error in cron job:", error);
  }
});

let currentMin = new Date().getMinutes();

const intervalId = setInterval(() => {
  const now = new Date();
  const newMin = now.getMinutes();

  // Check if the minute has changed and is even
  if (newMin !== currentMin && newMin % 15 === 0) {
    cronJob.start();
    dailyClearDatabaseJob.start();
    clearInterval(intervalId);
  }
}, 1000);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
