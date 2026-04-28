const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema({
  userEmail: String,
  name: String,
  education: String,
  experience: String,
  skills: String,
  photo: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Resume", resumeSchema);