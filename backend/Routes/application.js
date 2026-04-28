const express = require("express");
const router = express.Router();

const Application = require("../Model/Application");
const Subscription = require("../Model/Subscription");

router.post("/", async (req, res) => {
  try {
    console.log("📥 Incoming:", req.body);

    // ✅ Normalize email
    const userEmail = req.body.user?.email?.toLowerCase();

    if (!userEmail) {
      console.log("❌ Email missing");
      return res.status(400).json({
        success: false,
        message: "User email is required",
      });
    }

    console.log("👤 User Email:", userEmail);

    // 🔹 GET SUBSCRIPTION
    const sub = await Subscription.findOne({ email: userEmail });
    console.log("📦 Subscription:", sub);

    // 🔥 IDENTIFY USER TYPE
    const isFreeUser = !sub || sub.plan === "free";

    // 🔥 DEFINE ONCE (fix scope bug)
    const startOfMonth = new Date();
    startOfMonth.setUTCDate(1);
    startOfMonth.setUTCHours(0, 0, 0, 0);

    console.log("🕒 Start of month (UTC):", startOfMonth);

    // =========================
    // 🔹 FREE PLAN LOGIC
    // =========================
    if (isFreeUser) {
      const count = await Application.countDocuments({
        "user.email": userEmail,
        createdAt: { $gte: startOfMonth },
      });

      console.log("📊 Free user count:", count);

      if (count >= 1) {
        console.log("⛔ Free limit reached");

        return res.status(403).json({
          success: false,
          message: "Free plan limit reached (1 per month)",
        });
      }
    }

    // =========================
    // 🔹 PAID PLAN LOGIC (DYNAMIC COUNT)
    // =========================
    if (sub && sub.plan !== "free") {
      if (new Date() > sub.endDate) {
        return res.status(403).json({
          success: false,
          message: "Subscription expired",
        });
      }

      const used = await Application.countDocuments({
        "user.email": userEmail,
      });

      console.log("📊 Paid user count:", used);

      if (sub.applicationLimit !== -1 && used >= sub.applicationLimit) {
        return res.status(403).json({
          success: false,
          message: "Application limit reached",
        });
      }
    }

    // 🔥 CLEAN DATA STRUCTURE
    const applicationData = {
      company: req.body.company,
      category: req.body.category,
      coverLetter: req.body.coverLetter,
      internshipId: req.body.internshipId || null,
      jobId: req.body.jobId || null,
      availability: req.body.availability,
      resume: req.body.resume,
      user: {
        email: userEmail,
        name: req.body.user?.name,
      },
    };

    // =========================
    // 🔥 DOUBLE CHECK (ANTI-SPAM)
    // =========================
    if (isFreeUser) {
      const countAgain = await Application.countDocuments({
        "user.email": userEmail,
        createdAt: { $gte: startOfMonth },
      });

      if (countAgain >= 1) {
        console.log("⛔ Blocked at final check");

        return res.status(403).json({
          success: false,
          message: "Free plan limit reached (1 per month)",
        });
      }
    }

    // =========================
    // 🔹 SAVE APPLICATION
    // =========================
    const newApp = await Application.create(applicationData);
    console.log("✅ Saved:", newApp._id);

    // // =========================
    // // 🔹 INCREMENT USAGE (PAID ONLY)
    // // =========================
    // if (sub && sub.plan !== "free") {
    //   sub.applicationsUsed += 1;
    //   await sub.save();
    // }

    res.status(201).json({
      success: true,
      message: "Application submitted",
      data: newApp,
    });
  } catch (err) {
    console.error("🔥 ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const applications = await Application.find().sort({
      createdAt: -1,
    });

    res.status(200).json(applications);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.get("/count/:email", async (req, res) => {
  try {
    const email = req.params.email.toLowerCase();

    const count = await Application.countDocuments({
      "user.email": email,
    });

    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
