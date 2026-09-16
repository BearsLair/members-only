const express = require("express");
const app = express();
require("dotenv").config();

const session = require("express-session");
const passport = require("passport");
const pool = require("./db/pool");

const path = require("node:path");
const indexRouter = require("./routes/indexRouter");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

// Note to self: Authentication middleware must come before routes
// Connect postgresql db table to browser cookies
// Note to self: saveUninitialized does NOT go into sessions store
app.use(
  session({
    store: new (require("connect-pg-simple")(session))({
      pool: pool,
      createTableIfMissing: true,
    }),
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days
  }),
);

require("./config/passport");

app.use(passport.session());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.use("/", indexRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Now listening on Port ${PORT}!`);
});
