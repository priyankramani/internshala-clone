const express = require("express");
const router = express.Router();
const Post = require("../Model/Post");
const Friend = require("../Model/Friend");
const { canUserPost } = require("../utils/postLimit");
const User = require("../Model/User");
const upload = require("../utils/upload");

// Create Post
router.post("/create", async (req, res) => {
  try {
    const { userId, caption, mediaUrl, mediaType } = req.body;

    const friendData = await Friend.findOne({ userId });
    const friendCount = friendData ? friendData.friends.length : 0;

    const allowed = await canUserPost(userId, friendCount);

    if (!allowed) {
      return res.status(403).json({
        message: "Posting limit reached or no friends",
      });
    }

    const post = await Post.create({
      userId,
      caption,
      mediaUrl,
      mediaType,
    });

    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Posts
router.get("/:userId", async (req, res) => {
  const Friend = require("../Model/Friend");

  const userId = req.params.userId;

  const friendData = await Friend.findOne({ userId });

  const friendIds = friendData ? friendData.friends : [];

  // include own posts too
  const allowedUsers = [userId, ...friendIds];

  const posts = await Post.find({
    userId: { $in: allowedUsers },
  }).sort({ createdAt: -1 });

  const postsWithEmails = await Promise.all(
    posts.map(async (post) => {
      // Post owner email
      const user = await User.findOne({ uid: post.userId });

      const commentsWithEmails = await Promise.all(
        post.comments.map(async (comment) => {
          const commentUser = await User.findOne({
            uid: comment.userId,
          });

          return {
            ...comment._doc,
            userEmail: commentUser?.email || "Unknown",
          };
        }),
      );

      return {
        ...post._doc,
        userEmail: user?.email || "Unknown",
        comments: commentsWithEmails,
      };
    }),
  );

  res.json(postsWithEmails);
});

// Like Post
router.post("/like/:id", async (req, res) => {
  const { userId } = req.body;
  const post = await Post.findById(req.params.id);

  if (!post.likes.includes(userId)) {
    post.likes.push(userId);
  } else {
    post.likes = post.likes.filter((id) => id !== userId);
  }

  await post.save();
  res.json(post);
});

// Comment
router.post("/comment/:id", async (req, res) => {
  const { userId, text } = req.body;

  const post = await Post.findById(req.params.id);
  post.comments.push({ userId, text });

  await post.save();
  res.json(post);
});
// Upload media
router.post("/upload", upload.single("file"), (req, res) => {
  try {
    res.json({
      mediaUrl: req.file.path,
      mediaType: req.file.mimetype.startsWith("video") ? "video" : "image",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;
