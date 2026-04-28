const express = require("express");
const router = express.Router();
const User = require("../Model/User");

// Save user (called from frontend after login)
router.post("/save", async (req, res) => {
  const { uid, name, email, photo } = req.body;

  let user = await User.findOne({ uid });

  if (!user) {
    user = await User.create({ uid, name, email, photo });
  }

  res.json(user);
});

// 🔍 Search by email
router.get("/search", async (req, res) => {
  const { email } = req.query;

  const users = await User.find({
    email: { $regex: email, $options: "i" },
  }).limit(5);

  res.json(users);
});

module.exports = router;
