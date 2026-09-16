const { Router } = require("express");
const indexRouter = Router();
const membersController = require("../controllers/membersController");
// validators must be destructured
const { validators } = require("../validators/validators");
const { codeValidator } = require("../validators/codevalidator");
const passport = require("passport");

indexRouter.get("/", membersController.getHomePage);

indexRouter.get("/sign-up", membersController.getSignUp);

indexRouter.post("/sign-up", validators, membersController.postSignUp);

indexRouter.get("/code", validators, membersController.getCodePage);

indexRouter.post("/code", codeValidator, membersController.postCodePage);

indexRouter.get("/log-in", membersController.getLoginPage);

indexRouter.post(
  "/log-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/log-in",
  }),
);

module.exports = indexRouter;
