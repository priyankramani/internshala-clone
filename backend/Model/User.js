const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  uid: String,
  name: String,
  email: String,
  photo: String,
});

module.exports = mongoose.model("User", userSchema);
