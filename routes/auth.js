const router = require("express").Router();

const { RegisterValidator, LoginValidator } = require("../models/User");

const validator = require("../middlewares/validator");
const auth = require("../middlewares/auth");

const { sign_in, sign_up, user_me } = require("../controllers/auth.controller");

router.post("/signin", validator(LoginValidator), sign_in);

router.post("/signup", validator(RegisterValidator), sign_up);

router.get("/me", auth, user_me);

module.exports = router;
