const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  caption: String,
  mediaUrl: String,
  mediaType: { type: String, enum: ["image", "video"] },

  likes: [{ type: String }], // userIds
  comments: [
    {
      userId: String,
      text: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Post", postSchema);
