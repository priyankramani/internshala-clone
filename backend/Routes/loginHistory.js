const express = require("express");
const router = express.Router();
const LoginHistory = require("../Model/LoginHistory");
const requestIp = require("request-ip");
const { getDeviceInfo } = require("../utils/deviceInfo");
const axios = require("axios");

// 🔐 LOGIN TRACK + RULE CHECK
router.post("/track", async (req, res) => {
  try {
    const { userId, email, skipOTP } = req.body;

    const ip = requestIp.getClientIp(req);
    const { browser, os, device } = getDeviceInfo(req);

    const currentHour = new Date().getHours();

    // 🚫 RULE 1: Mobile restriction
    if (device === "mobile") {
      if (currentHour < 10 || currentHour > 13) {
        return res.status(403).json({
          message: "Mobile login allowed only between 10 AM to 1 PM",
        });
      }
    }

    // 🚨 RULE 2: Chrome requires OTP
    if (!skipOTP && browser === "Chrome") {
      await axios.post(
        "https://internshala-clone-uclt.onrender.com/api/otp/send",
        {
          email: email,
        },
      );

      return res.json({
        requireOTP: true,
        message: "OTP required for Chrome login",
      });
    }

    // 🚫 PREVENT DUPLICATE ENTRIES (within 5 seconds)
    const lastLogin = await LoginHistory.findOne({ userId }).sort({
      loginTime: -1,
    });

    if (lastLogin) {
      const diff =
        (Date.now() - new Date(lastLogin.loginTime).getTime()) / 1000;

      if (diff < 5) {
        return res.json({ success: true, message: "Duplicate skipped" });
      }
    }

    // ✅ SAVE LOGIN HISTORY
    await LoginHistory.create({
      userId,
      browser,
      os,
      device,
      ip,
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("LOGIN TRACK ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// 📜 GET LOGIN HISTORY
router.get("/:userId", async (req, res) => {
  try {
    const history = await LoginHistory.find({
      userId: req.params.userId,
    }).sort({ loginTime: -1 });

    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
