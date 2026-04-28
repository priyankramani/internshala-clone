const express = require("express");
const router = express.Router();
const razorpay = require("../utils/razorpay");
const Resume = require("../Model/Resume");
const Subscription = require("../Model/Subscription");
const nodemailer = require("nodemailer");
const plans = require("../utils/planConfig");
const sendInvoice = require("../utils/sendInvoice");
const crypto = require("crypto");

// CREATE ORDER
router.post("/create-order", async (req, res) => {
  try {
    const options = {
      amount: 5000, // ₹50
      currency: "INR",
      receipt: "resume_receipt_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Order creation failed" });
  }
});

// SAVE RESUME
router.post("/save-resume", async (req, res) => {
  const { email, resumeData } = req.body;

  try {
    // check if already exists
    let existing = await Resume.findOne({ userEmail: email });

    if (existing) {
      // update existing resume
      existing.name = resumeData.name;
      existing.education = resumeData.education;
      existing.experience = resumeData.experience;
      existing.skills = resumeData.skills;

      await existing.save();

      return res.json({
        success: true,
        message: "Resume updated",
      });
    }

    // create new resume
    const newResume = await Resume.create({
      userEmail: email,
      ...resumeData,
    });

    res.json({
      success: true,
      message: "Resume saved",
      data: newResume,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to save resume" });
  }
});

// GET RESUME
router.get("/get-resume/:email", async (req, res) => {
  try {
    const resume = await Resume.findOne({
      userEmail: req.params.email,
    });

    res.json(resume || {});
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error fetching resume" });
  }
});
// CREATE SUBSCRIPTION ORDER
router.post("/create-subscription-order", async (req, res) => {
  try {
    const { plan } = req.body;

    const now = new Date();
    const hour = now.getHours();

    // TIME RESTRICTION
    if (hour !== 10) {
      return res.status(403).json({
        message: "Payments allowed only between 10 AM to 11 AM",
      });
    }

    const pricing = {
      bronze: 10000,
      silver: 30000,
      gold: 100000,
    };

    const order = await razorpay.orders.create({
      amount: pricing[plan],
      currency: "INR",
      receipt: "sub_" + Date.now(),
    });
    console.log("PLAN:", plan);
    console.log("CREATED ORDER:", order);
    res.json(order);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Order failed" });
  }
});
// ACTIVATE SUBSCRIPTION
router.post("/activate-subscription", async (req, res) => {
  try {
    const { email, plan } = req.body;

    if (!email || !plan) {
      return res.status(400).json({
        success: false,
        message: "Email and plan required",
      });
    }

    const selectedPlan = plans[plan.toUpperCase()];

    if (!selectedPlan) {
      console.log("❌ PLAN NOT FOUND");
      return res.status(400).json({ message: "Invalid plan" });
    }

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const subscription = await Subscription.findOneAndUpdate(
      { email },
      {
        email,
        plan,
        applicationLimit: selectedPlan.limit,
        applicationsUsed: 0,
        startDate: new Date(),
        endDate,
      },
      { upsert: true, returnDocument: "after" },
    );

    // SEND INVOICE
    await sendInvoice(email, plan, selectedPlan.price);

    res.json({
      success: true,
      subscription,
    });
  } catch (err) {
    console.log("🔥 ACTIVATE ERROR:", err);
    res.status(500).json({ error: "Activation failed" });
  }
});

router.post("/verify-payment", (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      return res.json({ success: true });
    } else {
      return res.status(400).json({ success: false });
    }
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// GET SUBSCRIPTION BY EMAIL
router.get("/subscription/:email", async (req, res) => {
  try {
    let sub = await Subscription.findOne({
      email: req.params.email,
    });

    if (!sub) {
      return res.json(null);
    }

    const selectedPlan = plans[sub.plan.toUpperCase()];

    const response = {
      ...sub._doc,
      applicationLimit: selectedPlan ? selectedPlan.limit : 0,
    };

    console.log("FINAL RESPONSE:", response);

    res.json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch subscription" });
  }
});

module.exports = router;
