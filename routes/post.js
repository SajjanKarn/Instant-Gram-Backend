const router = require("express").Router();

const { PostValidator, CommentValidator } = require("../models/Post");

const validator = require("../middlewares/validator");
const auth = require("../middlewares/auth");

const {
  all_post,
  my_post,
  create_post,
  like_post,
  comment_post,
  delete_post,
  following_post,
  delete_comment,
} = require("../controllers/post.controller");

// rate limit for creating posts.
const createPostLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 20 minutes.
  max: 3, // start blocking after 2 requests
  handler: (req, res, next) => {
    return res.status(429).json({
      error: "You can only make 3 posts per hour",
    });

    next();
  },
});

// returns all posts.
router.get("/allpost", auth, all_post);

// returns logged in user posts.
router.get("/mypost", auth, my_post);

// creates a new post.
router.post(
  "/createpost",
  [auth, validator(PostValidator), createPostLimiter],
  create_post
);

// like unlike a post.
router.put("/like", auth, like_post);

// comment on a post.
router.put("/comment", [auth, validator(CommentValidator)], comment_post);

// delete a post.
router.delete("/delete/:postId", auth, delete_post);

// get followed user posts.
router.get("/followingpost", auth, following_post);

// delete a comment.
router.delete("/comment", auth, delete_comment);

module.exports = router;
