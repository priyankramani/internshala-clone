const mongoose = require("mongoose");

const loginHistorySchema = new mongoose.Schema({
  userId: String,
  browser: String,
  os: String,
  device: String,
  ip: String,
  loginTime: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("LoginHistory", loginHistorySchema);
