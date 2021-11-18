const router = require("express").Router();

const auth = require("../middlewares/auth");

const {
  get_user_profile,
  follow_user,
  search_user,
} = require("../controllers/user.controller");

router.get("/user/:userId", auth, get_user_profile);

router.put("/follow", auth, follow_user);

router.post("/search", auth, search_user);

module.exports = router;
