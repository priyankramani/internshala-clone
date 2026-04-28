const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  email: String,
  plan: {
    type: String,
    enum: ["free", "bronze", "silver", "gold"],
    default: "free",
  },
  applicationsUsed: {
    type: Number,
    default: 0,
  },
  month: {
    type: Number, // 0-11
  },
  year: {
    type: Number,
  },
});

module.exports = mongoose.model("Subscription", subscriptionSchema);
