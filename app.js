require("dotenv").config({ path: "./config/config.env" });
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const connectDB = require("./config/db");

const app = express();

// middlewares
app.use(express.json());
if (process.env.NODE_ENV === "development ") {
  app.use(morgan("tiny"));
  console.log(`morgan enabled...`);
}
app.use(cors());

// routes
app.use(require("./routes/auth"));
app.use(require("./routes/post"));
app.use(require("./routes/user"));

// server config
const PORT = process.env.PORT || 8000;
app.listen(PORT, async () => {
  await connectDB();
  console.log(
    `server listening on port ${PORT}..... on ${process.env.NODE_ENV}mode    `
  );
});
