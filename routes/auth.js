const router = require("express").Router();
const rateLimit = require("express-rate-limit");

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

// rate limiter for forgot password route.
const resetAccountLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes.
  max: 2, // start blocking after 2 requests
  handler: (req, res, next) => {
    return res.status(429).json({
      error:
        "Too many requests for resset link, please try again after half an hour.",
    });

    next();
  },
});

// rate limit for signup users.
const signUpRateLimiter = rateLimit({
  windowMs: 20 * 60 * 1000, // 20 minutes.
  max: 2, // start blocking after 2 requests
  handler: (req, res, next) => {
    return res.status(429).json({
      error: "Too many signup requests from your computer 😡",
    });

    next();
  },
});

router.post("/signin", validator(LoginValidator), sign_in);

router.post(
  "/signup",
  [validator(RegisterValidator), signUpRateLimiter],
  sign_up
);

router.put(
  "/password",
  [validator(ChangePasswordValidator), auth],
  change_password
);

router.post("/forgot-password", resetAccountLimiter, forgot_password);
router.post("/check-link", check_reset_link);
router.put("/reset-password", reset_password);

router.get("/me", auth, user_me);

module.exports = router;
