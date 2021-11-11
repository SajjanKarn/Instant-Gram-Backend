const jwt = require("jsonwebtoken");

const { User } = require("../models/User");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
      if (err) {
        return res.status(401).json({ success: false, error: "Unauthorized!" });
      }

      const user = await User.findOne({ _id: payload._id }).select("-password");
      req.user = user;
      next();
    });
  } else {
    res.status(403).json({ success: false, error: "Forbidden" });
  }
};
