const { body } = require("express-validator");

// Form input validation rules
exports.messageValidators = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty.")
    .isLength({ max: 255 })
    .withMessage("First name must be less than 255 characters"),
  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message text cannot be empty.")
    .isLength({ max: 255 })
    .withMessage("Last name must be less than 255 characters"),
];
