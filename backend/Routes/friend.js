const express = require("express");
const router = express.Router();
const Friend = require("../Model/Friend");
const User = require("../Model/User");

// Ensure user document exists
async function getOrCreate(userId) {
  let user = await Friend.findOne({ userId });
  if (!user) {
    user = await Friend.create({
      userId,
      friends: [],
      requestsSent: [],
      requestsReceived: [],
    });
  }
  return user;
}

// 🔹 Send Friend Request
router.post("/send", async (req, res) => {
  const { fromUserId, toUserId } = req.body;

  if (fromUserId === toUserId) {
    return res.status(400).json({ message: "Cannot add yourself" });
  }

  const fromUser = await getOrCreate(fromUserId);
  const toUser = await getOrCreate(toUserId);

  if (fromUser.friends.includes(toUserId)) {
    return res.status(400).json({ message: "Already friends" });
  }

  if (fromUser.requestsSent.includes(toUserId)) {
    return res.status(400).json({ message: "Request already sent" });
  }

  fromUser.requestsSent.push(toUserId);
  toUser.requestsReceived.push(fromUserId);

  await fromUser.save();
  await toUser.save();

  res.json({ message: "Request sent" });
});

// 🔹 Accept Request
router.post("/accept", async (req, res) => {
  const { userId, fromUserId } = req.body;

  const user = await getOrCreate(userId);
  const fromUser = await getOrCreate(fromUserId);

  user.requestsReceived = user.requestsReceived.filter(
    (id) => id !== fromUserId,
  );
  fromUser.requestsSent = fromUser.requestsSent.filter((id) => id !== userId);

  user.friends.push(fromUserId);
  fromUser.friends.push(userId);

  await user.save();
  await fromUser.save();

  res.json({ message: "Friend added" });
});

// 🔹 Reject Request
router.post("/reject", async (req, res) => {
  const { userId, fromUserId } = req.body;

  const user = await getOrCreate(userId);
  const fromUser = await getOrCreate(fromUserId);

  user.requestsReceived = user.requestsReceived.filter(
    (id) => id !== fromUserId,
  );
  fromUser.requestsSent = fromUser.requestsSent.filter((id) => id !== userId);

  await user.save();
  await fromUser.save();

  res.json({ message: "Request rejected" });
});

// 🔹 Get Friend Data
router.get("/:userId", async (req, res) => {
  const user = await getOrCreate(req.params.userId);

  // ✅ Fetch friend emails
  const friendUsers = await User.find({
    uid: { $in: user.friends },
  }).select("uid email");

  // ✅ Fetch request emails
  const requestUsers = await User.find({
    uid: { $in: user.requestsReceived },
  }).select("uid email");

  res.json({
    ...user._doc,
    friendsData: friendUsers,
    requestsData: requestUsers,
  });
});

module.exports = router;
