const express = require("express");
const app = express();
require("dotenv").config(); // Load environment variables from .env file before any other modules are loaded

const session = require("express-session");
const passport = require("passport");
const pool = require("./db/pool"); // Initialize database connection pool for session storage

const path = require("node:path");
const indexRouter = require("./routes/indexRouter"); // Load the main application router

// Configure EJS view engine and directory location
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Enable URL-encoded form data parsing (required for login forms)
app.use(express.urlencoded({ extended: true }));

// Connect PostgreSQL database table to browser cookies (stores session data in DB instead of memory)
// Note: saveUninitialized prevents creating a new session object on every request if no data exists yet
app.use(
  session({
    store: new (require("connect-pg-simple")(session))({
      // Use connect-pg-simple to persist sessions in the database
      pool: pool,
      createTableIfMissing: true, // Automatically create the session table if it doesn't exist on first run
    }),
    secret: process.env.COOKIE_SECRET, // Cryptographic key used to sign cookies; must be kept secret
    resave: false, // Prevents Express from saving a session object every time it receives a request (performance optimization)
    saveUninitialized: false, // Only saves sessions that have data in them (prevents unnecessary DB writes)
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // Set session expiration to 30 days from now
  }),
);

// Initialize Passport configuration and strategies (e.g., OAuth, Local)
require("./config/passport");

// Attach passport's session middleware so Express knows how to handle authentication state
app.use(passport.session());

/**
 * Rationale: This middleware runs for every request. It attaches the authenticated user object
 * to the response context (`res.locals`) so that views (EJS templates) can access `req.user` or `currentUser`.
 */
app.use((req, res, next) => {
  res.locals.currentUser = req.user; // Make the current logged-in user available in all EJS templates
  next();
});

// Mount the main application router at the root path ("/")
app.use("/", indexRouter);

const PORT = process.env.PORT || 3000; // Use environment variable if set, otherwise default to port 3000

/**
 * Rationale: Starts the Express server and listens for incoming HTTP requests on the specified port.
 */
app.listen(PORT, () => {
  console.log(`Now listening on Port ${PORT}!`);
});
