const { Router } = require("express");
const indexRouter = Router();
const membersController = require("../controllers/membersController");
// validators must be destructured
const { validators } = require("../validators/validators");
const { codeValidator } = require("../validators/codevalidator");
const { messageValidators } = require("../validators/message_validation");
const passport = require("passport");

// Home page containing all messages on database
indexRouter.get("/", membersController.getHomePage);

// Retrieve new member sign up page
indexRouter.get("/sign-up", membersController.getSignUp);

// Post new member information to database
indexRouter.post("/sign-up", validators, membersController.postSignUp);

// Retrieve full membership code page
indexRouter.get("/code", validators, membersController.getCodePage);

/*
If member enters correct code, they become a full member allowing them 
to see the names of other posters instead of just anonymous
*/
indexRouter.post("/code", codeValidator, membersController.postCodePage);

// Retrieve member log in page
indexRouter.get("/log-in", membersController.getLoginPage);

// Log in information is verified on database. Session cookie stored in browser
indexRouter.post(
  "/log-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/log-in",
  }),
);

// User logged out in browser
indexRouter.get("/log-out", membersController.getLogout);

// Retrieve the posting a new message page.
indexRouter.get("/message", membersController.getMessagePage);

// Post message to database and return to home page
indexRouter.post(
  "/message",
  messageValidators,
  membersController.postMessagePage,
);

// Allows a certified admin to delete a message on the home page.
indexRouter.get("/delete/:id", membersController.delMessage);

module.exports = indexRouter;
