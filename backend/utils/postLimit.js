const Post = require("../Model/Post");

async function canUserPost(userId, friendCount) {
  // No friends
  if (friendCount === 0) return false;

  // Unlimited
  if (friendCount > 10) return true;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const postsToday = await Post.countDocuments({
    userId,
    createdAt: { $gte: startOfDay },
  });

  return postsToday < friendCount;
}

module.exports = { canUserPost };
