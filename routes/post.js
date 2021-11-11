const router = require("express").Router();

const { Post, PostValidator } = require("../models/Post");
const validator = require("../middlewares/validator");
const auth = require("../middlewares/auth");

router.get("/allpost", auth, async (req, res) => {
  try {
    const allPosts = await Post.find().populate("postedBy", "-password");

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

module.exports = router;
