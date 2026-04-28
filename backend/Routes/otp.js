const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

let otpStore = {};

// Configure mail (Gmail App Password)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "priyankramani301@gmail.com",
    pass: "knkvwtwemwzobhtz", // ⚠️ keep this safe in .env later
  },
});

// SEND OTP
router.post("/send", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  const otp = Math.floor(100000 + Math.random() * 900000);

  otpStore[email] = otp;

  try {
    await transporter.sendMail({
      from: "InternArea",
      to: email,
      subject: "Your OTP for Login",
      text: `Your OTP is ${otp}`,
    });

    console.log(`OTP sent to ${email}: ${otp}`);

    res.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (err) {
    console.log("MAIL ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
});

// VERIFY OTP
router.post("/verify", (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: "Email and OTP required",
    });
  }

  if (otpStore[email] == otp) {
    delete otpStore[email];

    return res.json({
      success: true,
      message: "OTP verified",
    });
  }

  return res.status(400).json({
    success: false,
    message: "Invalid OTP",
  });
});

module.exports = router;
