const { Post } = require("../models/Post");
const { User } = require("../models/User");

exports.get_user_profile = async (req, res) => {
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
};

exports.follow_user = async (req, res) => {
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
};

exports.search_user = async (req, res) => {
  if (!req.body.query)
    return res
      .status(400)
      .json({ success: false, error: "Please enter a name" });

  try {
    let userPattern = new RegExp("^" + req.body.query);
    const users = await User.find({
      name: { $regex: userPattern, $options: "i" },
    });

    return res.status(200).json({ success: true, users });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: err });
  }
};

exports.get_all_user = async (req, res) => {
  try {
    const users = await User.find();

    return res.status(200).json({ success: true, users });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: err });
  }
};

exports.delete_user = async (req, res) => {
  const userId = req.user._id;

  try {
    const userPosts = await Post.find({ postedBy: userId });
    const deleteUserPosts = await Post.deleteMany({
      _id: {
        $in: userPosts,
      },
    });
    const removeLikes = await Post.updateMany(
      { likes: userId },
      { $pull: { likes: userId } }
    );
    const removeComments = await Post.updateMany(
      {
        comments: { $elemMatch: { postedBy: userId } },
      },
      { $pull: { comments: { postedBy: userId } } }
    );
    const removeFollowers = await User.updateMany(
      { followers: userId },
      { $pull: { followers: userId } }
    );
    const removeFollowings = await User.updateMany(
      { following: userId },
      { $pull: { following: userId } }
    );

    const deletedUser = await User.deleteOne({ _id: userId });

    return res.status(200).json({ success: true, message: "deleted user" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: err });
  }
};

exports.update_bio = async (req, res) => {
  try {
    const { bio } = req.body;

    const user = await User.findByIdAndUpdate(req.user._id, { bio });
    return res.status(200).json({ success: true, message: "Bio Updated!" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: err });
  }
};

exports.get_all_followers = async (req, res) => {
  const userId = req.user._id;
  try {
    const followers = await User.findOne({ _id: userId })
      .select("followers")
      .populate("followers");
    return res
      .status(200)
      .json({ success: true, followers: followers.followers });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: err });
  }
};

exports.get_all_following = async (req, res) => {
  const userId = req.user._id;
  try {
    const following = await User.findOne({ _id: userId })
      .select("following")
      .populate("following");

    return res
      .status(200)
      .json({ success: true, following: following.following });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: err });
  }
};
