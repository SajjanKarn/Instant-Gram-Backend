const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const validator = require("../middlewares/validator");
const auth = require("../middlewares/auth");
const { User, RegisterValidator, LoginValidator } = require("../models/User");

router.post("/signin", validator(LoginValidator), async (req, res) => {
  const { email, password } = req.body;

  try {
    const doesUserExists = await User.findOne({ email });
    if (!doesUserExists)
      return res
        .status(400)
        .json({ success: false, error: "Invalid email or password." });

    // if matches then check for password.
    const doesPasswordMatch = await bcrypt.compare(
      password,
      doesUserExists.password
    );
    if (!doesPasswordMatch)
      return res
        .status(400)
        .json({ success: false, error: "Invalid email or password." });

    const payload = { _id: doesUserExists._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET);

    doesUserExists.password = undefined;
    return res.status(200).json({ success: true, token, user: doesUserExists });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: err });
  }
});

router.post("/signup", validator(RegisterValidator), async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const doesUserAlreadyExists = await User.findOne({ email });
    if (doesUserAlreadyExists)
      // if user already exists with that username.
      return res.status(400).json({
        success: false,
        error: `A user already exists with that email.`,
      });

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({ name, email, password: hashedPassword });
    const user = await newUser.save();

    return res.status(201).json({ success: true, ...user._doc });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: err });
  }
});

router.get("/protect", auth, (req, res) => {
  res.send(req.user);
});

router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user._id }).select("-password");
    return res.status(200).json({ ...user._doc });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: err });
  }
});

module.exports = router;
