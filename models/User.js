const mongoose = require("mongoose");
const Joi = require("joi");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "name is required."],
  },
  email: {
    type: String,
    required: [true, "email is required."],
  },
  password: {
    type: String,
    required: [true, "password is required."],
  },
  profileImage: {
    type: String,
  },
  bio: {
    type: String,
  },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const User = new mongoose.model("User", UserSchema);

// register validaor.
const RegisterValidator = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(20).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(25).required(),
    profileImage: Joi.string().uri(),
  });

  return schema.validate(data);
};

// login validator
const LoginValidator = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  return schema.validate(data);
};

// change password validator.
const ChangePasswordValidator = (data) => {
  const schema = Joi.object({
    password: Joi.string(),
    newPassword: Joi.string().min(6).max(50).required(),
  });

  return schema.validate(data);
};

// bio update validator
const BioValidator = (data) => {
  const schema = Joi.object({
    bio: Joi.string().min(1).max(300).required(),
  });

  return schema.validate(data);
};

module.exports = {
  User,
  RegisterValidator,
  LoginValidator,
  ChangePasswordValidator,
  BioValidator,
};
