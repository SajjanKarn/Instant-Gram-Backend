const router = require("express").Router();

const {
  RegisterValidator,
  LoginValidator,
  ChangePasswordValidator,
} = require("../models/User");

const validator = require("../middlewares/validator");
const auth = require("../middlewares/auth");

const {
  sign_in,
  sign_up,
  user_me,
  change_password,
  forgot_password,
  check_reset_link,
  reset_password,
} = require("../controllers/auth.controller");

router.post("/signin", validator(LoginValidator), sign_in);

router.post("/signup", validator(RegisterValidator), sign_up);

router.put(
  "/password",
  [validator(ChangePasswordValidator), auth],
  change_password
);

router.post("/forgot-password", forgot_password);
router.post("/check-link", check_reset_link);
router.put("/reset-password", reset_password);

router.get("/me", auth, user_me);

module.exports = router;
