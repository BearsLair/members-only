const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const db = require("../db/query");

async function getHomePage(req, res) {
  try {
    // not to self: db functions must be called (e.g. getAllMessages())
    console.log("session user: ", req.user);
    const messages = await db.getAllMessages();
    res.render("home", {
      messages: messages,
      firstname: req.user.firstname,
      lastname: req.user.lastname,
      member: req.user.member,
    });
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
    if (!errors.isEmpty()) {
      return res.status(400).render("sign-up", {
        errors: errors.array(), // Converts errors to array for iteration
        formData: req.body, // Passes back entered data so user doesn't re-enter inputs
      });
    }

    // No errors? Continue.
    let data = req.body;
    data.password = bcrypt.hashSync(req.body.password, 10);

    db.postUserData(data);

    res.redirect("/");
  } catch (error) {
    console.error("Error posting sign up info: ", error);
  }
}

async function getCodePage(req, res) {
  try {
    res.render("code");
  } catch (error) {
    console.error("Error rendering code page: ", error);
  }
}

async function postCodePage(req, res) {
  const errors = validationResult(req);

  try {
    if (!errors.isEmpty()) {
      return res.status(400).render("code", {
        errors: errors.array(), // Converts errors to array for iteration
      });
    }

    // No errors? Continue.
    res.redirect("/");
  } catch (error) {
    console.error("Error posting code for verification: ", error);
  }
}

async function getLoginPage(req, res) {
  try {
    res.render("log-in");
  } catch (error) {
    console.error("Error rendering log in page", error);
  }
}

module.exports = {
  getHomePage,
  getSignUp,
  postSignUp,
  getCodePage,
  postCodePage,
  getLoginPage,
};
