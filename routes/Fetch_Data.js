const express = require("express");
const loginrequired = require("../middleware/loginrequired");
const NiftyData = require("../models/Nifty_Data");

const router = express.Router(); 

// Route 1: Get all nifty Oi data
router.get("/nifty", loginrequired, (req, res) => {
    NiftyData.find({}, (err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    });
});

module.exports = router;
