const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");

// Passport Config
require("./config/passport")(passport);

// Load Routes
const auth = require("./routes/auth");

const app = express();

app.get("/", (req, res) => {
  res.send("Welcome");
});

// Use Routes
app.use("/auth", auth);

// Server Config
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
