const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { User } = require("../models/User");

exports.sign_in = async (req, res) => {
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
};

exports.sign_up = async (req, res) => {
  const { name, email, password, profileImage } = req.body;

  try {
    const doesUserAlreadyExists = await User.findOne({ email });
    if (doesUserAlreadyExists)
      // if user already exists with that username.
      return res.status(400).json({
        success: false,
        error: `A user already exists with that email.`,
      });

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      name,
      email,
      profileImage,
      password: hashedPassword,
    });
    const user = await newUser.save();

    return res.status(201).json({ success: true, ...user._doc });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: err });
  }
};

exports.change_password = async (req, res) => {
  const { password, newPassword } = req.body;
  try {
    const user = await User.findOne({ _id: req.user._id });
    const doesPasswordMatch = await bcrypt.compare(password, user.password);

    if (!doesPasswordMatch)
      return res
        .status(403)
        .json({ success: false, error: "Incorrect current password" });

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const result = await User.updateOne(
      { _id: req.user._id },
      { password: hashedPassword }
    );

    return res.status(200).json({ success: true, ...result._doc });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: err });
  }
};

exports.user_me = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user._id }).select("-password");
    return res.status(200).json({ ...user._doc });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: err });
  }
};
