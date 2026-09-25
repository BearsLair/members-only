const passport = require("passport"); // Import Passport middleware to manage authentication strategies
const LocalStrategy = require("passport-local").Strategy; // Import the local strategy (username/password) instead of OAuth or JWT
const bcrypt = require("bcryptjs"); // Import hashing library for secure password comparison
const pool = require("../db/pool"); // Import database connection pool used for querying user data

/**
 * Rationale: This defines the authentication logic using the LocalStrategy.
 * It tells Passport how to verify a user's credentials against the database before granting access.
 */
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      // Query the database for the specific user based on the provided username.
      // Using parameterized queries ($1) prevents SQL injection attacks.
      const { rows } = await pool.query(
        "SELECT * FROM users WHERE username = $1",
        [username],
      );

      const user = rows[0]; // Extract the first (and expected only) row from results

      if (!user) {
        // Rationale: If no user is found with this username, we return a failure signal.
        // Passing an object `{ message: "Incorrect username" }` allows Passport to pass this
        // error object back to the view layer so the frontend can display a custom error message
        // instead of a generic 401/403 response.
        return done(null, false, { message: "Incorrect username" });
      }

      // Compare the provided password with the hashed password stored in the database using bcrypt.
      // This ensures we are comparing hashes against hashes, not plain text.
      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        // If the hash doesn't match (wrong password), return a failure signal.
        // Similar to above, this allows the frontend to display "Incorrect password".
        return done(null, false, { message: "Incorrect password" });
      }

      // SUCCESS: Credentials are valid. Return the full user object so Passport can attach it
      // to the request context (req.user) for subsequent routes and views.
      return done(null, user);
    } catch (error) {
      // Rationale: Catch any database errors or unexpected exceptions during authentication.
      // Passing `done(error)` stops the flow and triggers Passport's error handling middleware
      // to log the issue securely without exposing internal DB details to the client.
      return done(error);
    }
  }),
);

/**
 * Rationale: This function defines how Passport should serialize (store) a user object into the session store.
 * Storing the entire `user` object here is inefficient for large datasets; instead, we only save
 * the unique database ID (`id`). The actual data will be fetched back when needed via deserializeUser.
 */
passport.serializeUser((user, done) => done(null, user.id));

/**
 * Rationale: This function defines how Passport should deserialize (retrieve) a user object from the session store.
 * When a request comes in with a valid session ID, Passport calls this to fetch the full user details
 * (like name, permissions, etc.) back into memory so they can be attached to `req.user`.
 */
passport.deserializeUser(async (id, done) => {
  try {
    // Query the userinfo table to retrieve specific profile fields needed for the application.
    // We select only necessary columns (firstname, lastname, member status, admin status, usersid)
    // rather than fetching the entire row to optimize performance.
    const { rows } = await pool.query(
      "SELECT firstname, lastname, member, admin, usersid FROM userinfo WHERE usersid = $1",
      [id],
    );

    const user = rows[0]; // Extract the user object from results

    done(null, user); // Return the populated user object to Passport so it attaches it to req.user
  } catch (err) {
    // If the session ID is invalid or the user data cannot be found in the database,
    // we pass the error. This typically results in the user being logged out or redirected to login.
    done(err);
  }
});
