const express = require("express");
const router = express.Router();

const resetRequests = {};
// { email: timestamp }

router.post("/request-reset", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email required" });
  }

  const now = Date.now();
  const lastRequest = resetRequests[email];

  if (lastRequest && now - lastRequest < 24 * 60 * 60 * 1000) {
    return res.status(429).json({
      message: "You can use this option only once per day.",
    });
  }

  // allow request
  resetRequests[email] = now;

  res.json({ success: true });
});

module.exports = router;
