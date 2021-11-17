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
} = require("../controllers/post.controller");

// returns all posts.
router.get("/allpost", auth, all_post);

// returns logged in user posts.
router.get("/mypost", auth, my_post);

// creates a new post.
router.post("/createpost", [auth, validator(PostValidator)], create_post);

// like unlike a post.
router.put("/like", auth, like_post);

// comment on a post.
router.put("/comment", [auth, validator(CommentValidator)], comment_post);

// delete a post.
router.delete("/delete/:postId", auth, delete_post);

// get followed user posts.
router.get("/followingpost", auth, following_post);

module.exports = router;
