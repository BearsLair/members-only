const { validationResult } = require("express-validator"); // Extract validator helper to reduce noise in controller logic
const bcrypt = require("bcryptjs"); // Hash passwords before storing them; never store plain text passwords
const db = require("../db/query"); // Import database query functions for data persistence

/**
 * Rationale: The home page is the main dashboard. It retrieves all messages from the DB
 * and renders the view, passing user-specific details (name, membership status) only if authenticated.
 */
async function getHomePage(req, res) {
  try {
    // Fetch all messages from the database to display on the homepage
    const messages = await db.getAllMessages();

    // Determine what user data to pass based on authentication state:
    // If logged in, pass their profile details and permissions.
    // If not logged in, pass false values so templates can conditionally hide/show elements without errors.
    if (req.user) {
      res.render("home", {
        messages: messages,
        firstname: req.user.firstname,
        lastname: req.user.lastname,
        member: req.user.member,
        admin: req.user.admin,
      });
    } else {
      res.render("home", {
        messages: messages,
        firstname: false,
        member: false,
        admin: false,
      });
    }
  } catch (error) {
    // Log the error to help with debugging; in production, this should be handled by a global error middleware
    console.error("Error retrieving home page: ", error);
  }
}

/**
 * Rationale: This route handles the GET request for the sign-up form. It simply renders the view
 * with an empty object to ensure no validation errors are pre-filled before the user starts typing.
 */
async function getSignUp(req, res) {
  try {
    // Render the sign-up template with an empty data object
    res.render("sign-up", { formData: {} });
  } catch (error) {
    console.error("Error retrieving sign-up page: ", error);
  }
}

/**
 * Rationale: This route handles the POST request for creating a new user.
 * It validates input, checks for admin privileges via a secret key, hashes the password,
 * and saves the data to the database.
 */
async function postSignUp(req, res) {
  try {
    // Retrieve validation errors from express-validator; if any exist, stop processing here
    const errors = validationResult(req);

    // If validation failed (e.g., missing fields), return the form with error messages and current input data
    // so the user doesn't have to re-type everything.
    if (!errors.isEmpty()) {
      return res.status(400).render("sign-up", {
        errors: errors.array(),
        formData: req.body,
      });
    }

    let data = req.body;

    // SECURITY RATIONALE: Admin accounts are created via a secret password check.
    // This prevents unauthorized users from creating admin accounts by simply guessing the username/password.
    if (req.body.admin === process.env.ADMIN_PASS) {
      data.admin = true; // Mark as admin only if the correct secret key is provided
    } else if (
      req.body.admin !== process.env.ADMIN_PASS &&
      req.body.admin !== ""
    ) {
      // If a user tries to create an account claiming to be admin but doesn't know the secret,
      // reject it with a specific error. This enforces strict access control for administrative roles.
      return res.status(400).render("sign-up", {
        errors: [{ msg: "Wrong admin password." }],
        formData: req.body,
      });
    }

    // Hash the password using bcrypt before saving to DB; this ensures stored passwords are secure
    data.password = bcrypt.hashSync(req.body.password, 10);

    // Save the new user record to the database
    db.postUserData(data);

    // Redirect to login page after successful registration
    res.redirect("/log-in");
  } catch (error) {
    console.error("Error posting sign up info: ", error);
  }
}

/**
 * Rationale: Renders code for Full Membership (users of posts have their names revealed in place of 'anonymous')
 */
async function getCodePage(req, res) {
  try {
    res.render("code");
  } catch (error) {
    console.error("Error rendering code page: ", error);
  }
}

/**
 * Rationale: Handles the POST request for submitting a verification code.
 * It validates the input and calls the database to upgrade the user's status to 'member'.
 */
async function postCodePage(req, res) {
  const errors = validationResult(req); // Check if validation passed (e.g., correct code length/format)

  try {
    if (!errors.isEmpty()) {
      return res.status(400).render("code", {
        errors: errors.array(),
      });
    }

    // Retrieve the user's ID from the authenticated session to identify who is upgrading
    const id = req.user.usersid;

    // Call DB function to update user status based on the verified code
    db.postUpgradeToMember(id);

    res.redirect("/"); // Redirect to home upon successful upgrade
  } catch (error) {
    console.error("Error posting code for verification: ", error);
  }
}

/**
 * Rationale: Renders the login form. This is a simple GET handler that prepares the view
 * without any database interaction, as it only requires user input.
 */
async function getLoginPage(req, res) {
  try {
    res.render("log-in");
  } catch (error) {
    console.error("Error rendering log in page", error);
  }
}

/**
 * Rationale: Handles the logout process. Passport provides a built-in `req.logout()` function
 * that clears session data and destroys cookies securely. We wrap it in a try/catch to handle
 * any passport-specific errors gracefully.
 */
async function getLogout(req, res, next) {
  try {
    // Execute the logout logic provided by Passport
    req.logout((err) => {
      if (err) {
        return next(err); // Pass error up to global error handler if something goes wrong during logout
      }
    });

    // Redirect user to home page after clearing their session
    res.redirect("/");
  } catch (error) {
    console.error("Error logging out", error);
  }
}

/**
 * Rationale: Renders the message composition form. It passes the current user's ID
 * so that when they submit a message, it knows which account owns it.
 */
async function getMessagePage(req, res) {
  try {
    // Pass user ID and empty form data to the template
    res.render("message", { usersid: req.user.usersid, formData: {} });
  } catch (error) {
    console.error("Error retrieving message page", error);
  }
}

/**
 * Rationale: Handles the POST request for submitting a new message.
 * It validates input, then calls the database to store the title and content of the message.
 */
async function postMessagePage(req, res) {
  try {
    const errors = validationResult(req); // Validate required fields (e.g., title not empty)

    if (!errors.isEmpty()) {
      return res.status(400).render("message", {
        errors: errors.array(),
        formData: req.body,
        usersid: req.user.usersid, // Pass user ID back to form so it's pre-filled in hidden input
      });
    }

    // If validation passed, call the database function to insert the new message record
    await db.postMessage(req.body.title, req.body.message, req.body.usersid);

    res.redirect("/"); // Redirect home after successful post
  } catch (error) {
    console.error("Error posting message", error);
  }
}

/**
 * Rationale: Handles the deletion of a specific message.
 * It extracts the message ID from the URL parameters and calls the DB to remove it, then redirects.
 */
async function delMessage(req, res) {
  const id = req.params.id; // Get the unique identifier for the message being deleted

  try {
    await db.deleteMessage(id); // Execute deletion in database
    res.redirect("/"); // Redirect home after successful deletion
  } catch (error) {
    console.error(error); // Log error details for debugging
  }
}

// Export all controller functions so routes can import and call them individually
module.exports = {
  getHomePage,
  getSignUp,
  postSignUp,
  getCodePage,
  postCodePage,
  getLoginPage,
  getLogout,
  getMessagePage,
  postMessagePage,
  delMessage,
};
