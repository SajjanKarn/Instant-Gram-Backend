const router = require("express").Router();

const auth = require("../middlewares/auth");

const {
  get_user_profile,
  follow_user,
  search_user,
  get_all_user,
} = require("../controllers/user.controller");

router.get("/user/:userId", auth, get_user_profile);

router.put("/follow", auth, follow_user);

router.post("/search", auth, search_user);

router.get("/allusers", auth, get_all_user);

module.exports = router;
