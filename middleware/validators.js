const { body } = require("express-validator");

// Form input validation rules
exports.validators = [
  body("firstname")
    .trim()
    .notEmpty.withMessage("First name cannot be empty.")
    .isAlpha()
    .withMessage("First name must contain only alphabet characters.")
    .isLength("First name must be less than 30 characters"),
  body("lastname")
    .trim()
    .notEmpty.withMessage("Last name cannot be empty.")
    .isAlpha()
    .withMessage("Last name must contain only alphabet characters.")
    .isLength("Last name must be less than 30 characters"),
  body("username")
    .trim()
    .notEmpty.withMessage("Username cannot be empty.")
    .isLength("First name must be less than 30 characters"),
  body("password")
    .trim()
    .notEmpty.withMessage("Password cannot be empty.")
    .isLength("Password must be less than 30 characters"),
];
