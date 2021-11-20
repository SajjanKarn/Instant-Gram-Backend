const router = require("express").Router();

const auth = require("../middlewares/auth");
const validator = require("../middlewares/validator");

const { BioValidator } = require("../models/User");

const {
  get_user_profile,
  follow_user,
  search_user,
  get_all_user,
  delete_user,
  update_bio,
} = require("../controllers/user.controller");

router.get("/user/:userId", auth, get_user_profile);

router.put("/follow", auth, follow_user);

router.post("/search", auth, search_user);

router.get("/allusers", auth, get_all_user);

router.delete("/deleteuser", auth, delete_user);

router.put("/updatebio", [auth, validator(BioValidator), update_bio]);

module.exports = router;
