const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");

// Load User Model
require("./models/User");

// Passport Config
require("./config/passport")(passport);

// Load Routes
const auth = require("./routes/auth");

// Load Keys
const keys = require("./config/keys");

// Map global promises
mongoose.Promise = global.Promise;
// Mongoose Connect
mongoose
  .connect(keys.mongoURI)
  .then(() => console.log("MongoDB Connected..."))
  .catch(err => console.log(err));

const app = express();

app.get("/", (req, res) => {
  res.send("Welcome");
});

// Cookie Parser and Express Session Config
app.use(cookieParser());
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false
  })
);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Set global vars
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// Use Routes
app.use("/auth", auth);

// Server Config
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
