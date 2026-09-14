const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

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

    console.log("errors: ", errors);

    // Stop execution and display errors if errors found
    if (!errors.isEmpty()) {
      return res.status(400).render("sign-up", {
        errors: errors.array(), // Converts errors to array for iteration
        formData: req.body, // Passes back entered data so user doesn't re-enter inputs
      });
    }

    // No errors? Continue.
    let data = req.body;
    data.password = bcrypt.hashSync(req.body.password, 10);

    console.log(data);
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
