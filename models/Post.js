const mongoose = require("mongoose");
const Joi = require("joi");

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "title is required."],
    },
    body: {
      type: String,
      required: [true, "body is required."],
    },
    imageURL: {
      type: String,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [
      {
        comment: String,
        postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Post = new mongoose.model("Post", PostSchema);

// post validator...
const PostValidator = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(3).max(50).required(),
    body: Joi.string().min(3).max(250).required(),
    imageURL: Joi.string().uri(),
  });

  return schema.validate(data);
};

// comment validator
const CommentValidator = (data) => {
  const schema = Joi.object({
    comment: Joi.string().min(1).max(500),
    postId: Joi.string(),
  });

  return schema.validate(data);
};

module.exports = {
  Post,
  PostValidator,
  CommentValidator,
};
