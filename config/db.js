const mongoose = require("mongoose");

const connectDB = () => {
  return mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log(`connection to db established...`))
    .catch((err) => console.log(err));
};

module.exports = connectDB;
