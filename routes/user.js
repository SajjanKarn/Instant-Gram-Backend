const router = require("express").Router();
const mongoose = require("mongoose");

const { Post } = require("../models/Post");
const { User } = require("../models/User");
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

router.put("/follow", auth, async (req, res) => {
  const { userId } = req.body;

  const followingUser = await User.findOne({ _id: userId });

  if (!followingUser)
    return res
      .status(400)
      .json({ success: false, error: "no such user exists with that id!" });

  try {
    if (!followingUser.followers.includes(req.user._id)) {
      const userToFollow = await User.findByIdAndUpdate(
        userId,
        { $push: { followers: req.user._id } },
        { new: true }
      );
      const userHasFollowed = await User.findByIdAndUpdate(
        req.user._id,
        { $push: { following: userId } },
        { new: true }
      );
      return res.status(200).json({ ...userToFollow._doc });
    } else {
      const userToUnfollow = await User.findByIdAndUpdate(
        userId,
        { $pull: { followers: req.user._id } },
        { new: true }
      );
      const userHasUnfollowed = await User.findByIdAndUpdate(
        req.user._id,
        { $pull: { following: userId } },
        { new: true }
      );
      return res.status(200).json({ ...userToUnfollow._doc });
    }
    const userHasFollowed = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { following: userId } },
      { new: true }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: err });
  }
});

module.exports = router;
