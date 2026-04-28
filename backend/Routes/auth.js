const express = require("express");
const router = express.Router();

const resetRequests = {}; // temporary

router.post("/reset-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email required" });
  }

  const now = Date.now();

  // Check last request
  if (resetRequests[email]) {
    const diff = (now - resetRequests[email]) / (1000 * 60 * 60 * 24);

    if (diff < 1) {
      return res.status(429).json({
        message: "You can use this option only once per day.",
      });
    }
  }

  // Save request time
  resetRequests[email] = now;

  return res.json({ success: true });
});

module.exports = router;
