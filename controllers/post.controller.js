const { Post } = require("../models/Post");
const mongoose = require("mongoose");

exports.all_post = async (req, res) => {
  try {
    const allPosts = await Post.find().populate(
      "postedBy comments.postedBy",
      "-password"
    );

    return res.status(200).json({ success: true, posts: allPosts });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: err });
  }
};

exports.my_post = async (req, res) => {
  try {
    const userPosts = await Post.find({ postedBy: req.user._id });

    return res.status(200).json({ success: true, posts: userPosts });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: err });
  }
};

exports.create_post = async (req, res) => {
  const { title, body, imageURL } = req.body;

  try {
    const newPost = new Post({ title, body, imageURL, postedBy: req.user });
    const post = await newPost.save();

    return res.status(201).json({ success: true, ...post._doc });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: err });
  }
};

exports.like_post = async (req, res) => {
  const { postId } = req.body;
  const post = await Post.findOne({ _id: postId });

  try {
    if (!post.likes.includes(req.user._id)) {
      const likeResult = await Post.findByIdAndUpdate(
        postId,
        { $push: { likes: req.user._id } },
        { new: true }
      ).populate("postedBy comments.postedBy", "_id name");

      if (likeResult) {
        return res.status(200).json({ ...likeResult._doc });
      }
    } else {
      const unLikeResult = await Post.findByIdAndUpdate(
        postId,
        { $pull: { likes: req.user._id } },
        { new: true }
      ).populate("postedBy comments.postedBy", "_id name");
      if (unLikeResult) {
        return res.status(200).json({ ...unLikeResult._doc });
      }
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: err });
  }
};

exports.comment_post = async (req, res) => {
  const { postId, comment } = req.body;

  try {
    const result = await Post.findByIdAndUpdate(
      postId,
      {
        $push: { comments: { comment, postedBy: req.user._id } },
      },
      { new: true }
    ).populate("postedBy comments.postedBy", "_id name");

    if (result) {
      return res.status(200).json({ success: true, ...result._doc });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: err });
  }
};

exports.delete_post = async (req, res) => {
  const { postId } = req.params;
  if (!postId)
    return res
      .status(400)
      .json({ success: false, error: "Please enter postId" });

  try {
    const post = await Post.findOne({ _id: postId }).populate(
      "postedBy",
      "_id"
    );

    if (post.postedBy._id.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, error: "Can't delete other user posts!" });
    }

    // else delete...
    const result = await post.remove();

    return res.status(200).json({ success: true, ...result._doc });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: err });
  }
};

exports.following_post = async (req, res) => {
  try {
    console.log(req.user);
    const allPosts = await Post.find({
      postedBy: { $in: req.user.following },
    }).populate("postedBy comments.postedBy", "-password");

    return res.status(200).json({ success: true, posts: allPosts });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: err });
  }
};

exports.delete_comment = async (req, res) => {
  const { commentId, postId } = req.body;

  if (!commentId || !postId)
    return res
      .status(400)
      .json({ success: false, error: "please provide post id and comment id" });

  if (!mongoose.isValidObjectId(commentId))
    return res
      .status(400)
      .json({ success: false, error: "valid comment id is required." });

  try {
    const post = await Post.findOne({ _id: postId }).populate(
      "comments.postedBy",
      "_id"
    );

    const userComment = post.comments.find(
      (x) => x._id.toString() === commentId.toString()
    );

    if (userComment.postedBy._id.toString() !== req.user._id.toString()) {
      return res
        .status(400)
        .json({ success: false, error: "Cannot delete other user comments!" });
    }

    // if the comment is users own comment. delete it
    const deletedPost = await Post.findByIdAndUpdate(
      postId,
      { $pull: { comments: { _id: commentId } } },
      { new: true }
    );

    const allPosts = await Post.find().populate(
      "postedBy comments.postedBy",
      "-password"
    );

    return res.status(200).json({ success: true, posts: allPosts });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: err });
  }
};
