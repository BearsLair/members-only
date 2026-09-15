const { body } = require("express-validator");

exports.codeValidator = [
  body("code")
    .trim()
    .notEmpty()
    .withMessage("Code input cannot be empty!")
    .custom((value) => {
      if (value !== process.env.MEMBERPASS) {
        throw new Error(
          "Like, that is not the correct full membership password! Try again.",
        );
      }
      return true;
    }),
];
