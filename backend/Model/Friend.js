const mongoose = require("mongoose");

const friendSchema = new mongoose.Schema({
  userId: { type: String, required: true },

  friends: [{ type: String }], // accepted friends

  requestsSent: [{ type: String }],
  requestsReceived: [{ type: String }],
});

module.exports = mongoose.model("Friend", friendSchema);
