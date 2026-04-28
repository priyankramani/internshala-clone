const express = require("express");
const router = express.Router();
const admin = require("./admin");
const intern = require("./internship");
const job = require("./job");
const application = require("./application");
const otp = require("./otp");
const resume = require("./resume");
const authRoutes = require("./auth");
const reset = require("./reset");
const post = require("./Post");
const friend = require("./friend");
const user = require("./user");
const loginHistory = require("./loginHistory");

router.use("/admin", admin);
router.use("/internship", intern);
router.use("/job", job);
router.use("/application", application);
router.use("/otp", otp);
router.use("/resume", resume);
router.use("/auth", authRoutes);
router.use("/reset", reset);
router.use("/post", post);
router.use("/friend", friend);
router.use("/user", user);
router.use("/login", loginHistory);

module.exports = router;
