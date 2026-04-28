const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    company: { type: String, required: true },
    category: { type: String, required: true },
    coverLetter: { type: String, required: true },
    internshipId: { type: String, default: null },
    jobId: { type: String, default: null }, // ✅ ADD THIS
    availability: { type: String, required: true },

    resume: { type: Object}, // ✅ make optional

    user: {
      email: { type: String, required: true, index: true },
      name: String,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "accepted", "rejected"],
      default: "pending",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }, // 🔥 IMPORTANT
);

module.exports = mongoose.model("Application", applicationSchema);