const { validationResult } = require("express-validator");

async function getHomePage(req, res) {
  try {
    res.render("home");
  } catch (error) {
    console.error("Error retrieving home page: ", error);
  }
}

async function getSignUp(req, res) {
  try {
    res.render("sign-up", { formData: {} });
  } catch (error) {
    console.error("Error retrieving sign-up page: ", error);
  }
}

async function postSignUp(req, res) {
  try {
    //retrieve validation errors from request
    const errors = validationResult(req);

    // Stop execution and display errors if errors found
    if (!error.isEmpty()) {
      return res.status(400).render("sign-up", {
        errors: errors.array(), // Converts errors to array for iteration
        formData: req.body, // Passes back entered data so user doesn't re-enter inputs
      });
    }

    console.log(req.body);
    res.redirect("/");
  } catch (error) {
    console.error("Error posting sign up info: ", error);
  }
}

module.exports = {
  getHomePage,
  getSignUp,
  postSignUp,
};
