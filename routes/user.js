const router = require("express").Router();

const { Post } = require("../models/Post");
const { User } = require("../models/User");
const validator = require("../middlewares/validator");
const auth = require("../middlewares/auth");

router.get("/user/:userId", auth, async (req, res) => {
  const { userId } = req.params;

  if (!userId)
    return res
      .status(400)
      .json({ success: false, error: "userid is required." });

  try {
    const user = await User.findOne({ _id: userId }).select("-password");
    const userPosts = await Post.find({ postedBy: userId }).populate(
      "postedBy",
      "-password"
    );

    return res.status(200).json({ success: true, user, posts: userPosts });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: err });
  }
});

module.exports = router;
