const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

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

exports.forgot_password = async (req, res) => {
  const { email } = req.body;

  try {
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.USER, // generated ethereal user
        pass: process.env.PASS, // generated ethereal password
      },
    });

    const doesUserExist = await User.findOne({ email });
    if (!doesUserExist)
      return res
        .status(400)
        .json({ success: false, error: "No Such User Exists!" });

    // generate random tokens for every users.
    const SECRET = process.env.JWT_SECRET + doesUserExist.password;
    const payload = {
      email,
      _id: doesUserExist._id,
    };

    const token = jwt.sign(payload, SECRET, { expiresIn: "15m" });

    let info = await transporter.sendMail({
      from: '"InstantGram 👻" <noreply@gmail.com>', // sender address
      to: email, // list of receivers
      subject: "Reset Your Password ✔", // Subject line
      text: "You can reset your password from the below link. The link is only valid for 15 minutes.",
      html: `<a href="https://instagram.sajjan.tech/reset-password/${payload._id}/${token}">Reset Password</a>`,
    });

    return res.status(200).json({
      success: true,
      message: `A reset link has been sent to your email address ${email}`,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: err });
  }
};

exports.reset_password = async (req, res) => {
  const { _id, token, password } = req.body;

  if (password.length < 6)
    return res.status(400).json({
      success: false,
      error: "password length must be atleast 6 characters long!",
    });

  try {
    const doesUserExist = await User.findOne({ _id });
    if (!doesUserExist)
      return res
        .status(400)
        .json({ success: false, error: "No Such User Exists!" });

    // generate random tokens for every users.
    const SECRET = process.env.JWT_SECRET + doesUserExist.password;
    jwt.verify(token, SECRET, async (err, payload) => {
      if (err) {
        return res.status(403).json({
          success: false,
          error: "The link has expired or the provided token is invalid!",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const updatedUser = await User.updateOne(
        { _id: payload._id },
        { password: hashedPassword }
      );

      return res
        .status(200)
        .json({ success: true, message: "Password changed!" });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: err });
  }
};

exports.check_reset_link = async (req, res) => {
  const { _id, token } = req.body;

  if (!_id || !token)
    return res
      .status(400)
      .json({ success: false, error: "ID and token are required!" });
  try {
    const doesUserExist = await User.findOne({ _id });

    if (!doesUserExist)
      return res
        .status(400)
        .json({ success: false, error: "No such user exists!" });

    const SECRET = process.env.JWT_SECRET + doesUserExist.password;
    jwt.verify(token, SECRET, (err, payload) => {
      if (err) {
        return res
          .status(400)
          .json({ success: false, error: "Invalid token!" });
      }

      return res.status(200).json({ success: true, message: "link verified!" });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: err });
  }
};
