const router = require("express").Router();

const { Post, PostValidator, CommentValidator } = require("../models/Post");
const validator = require("../middlewares/validator");
const auth = require("../middlewares/auth");

router.get("/allpost", auth, async (req, res) => {
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
});

router.get("/mypost", auth, async (req, res) => {
  try {
    const userPosts = await Post.find({ postedBy: req.user._id });

    return res.status(200).json({ success: true, posts: userPosts });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: err });
  }
});

router.post(
  "/createpost",
  [auth, validator(PostValidator)],
  async (req, res) => {
    const { title, body, imageURL } = req.body;

    try {
      const newPost = new Post({ title, body, imageURL, postedBy: req.user });
      const post = await newPost.save();

      return res.status(201).json({ success: true, ...post._doc });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ success: false, error: err });
    }
  }
);

router.put("/like", auth, async (req, res) => {
  const { postId } = req.body;
  const post = await Post.findOne({ _id: postId });

  try {
    if (!post.likes.includes(req.user._id)) {
      const likeResult = await Post.findByIdAndUpdate(
        postId,
        { $push: { likes: req.user._id } },
        { new: true }
      ).populate("comments.postedBy", "_id name");

      if (likeResult) {
        return res.status(200).json({ ...likeResult._doc });
      }
    } else {
      const unLikeResult = await Post.findByIdAndUpdate(
        postId,
        { $pull: { likes: req.user._id } },
        { new: true }
      ).populate("comments.postedBy", "_id name");
      if (unLikeResult) {
        return res.status(200).json({ ...unLikeResult._doc });
      }
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: err });
  }
});

router.put(
  "/comment",
  [auth, validator(CommentValidator)],
  async (req, res) => {
    const { postId, comment } = req.body;

    try {
      const result = await Post.findByIdAndUpdate(
        postId,
        {
          $push: { comments: { comment, postedBy: req.user._id } },
        },
        { new: true }
      ).populate("comments.postedBy", "_id name");

      if (result) {
        return res.status(200).json({ success: true, ...result._doc });
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({ success: false, error: err });
    }
  }
);

module.exports = router;
