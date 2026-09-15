const { Router } = require("express");
const indexRouter = Router();
const membersController = require("../controllers/membersController");
// validators must be destructured
const { validators } = require("../validators/validators");
const { codeValidator } = require("../validators/codevalidator");

indexRouter.get("/", membersController.getHomePage);

indexRouter.get("/sign-up", membersController.getSignUp);

indexRouter.post("/sign-up", validators, membersController.postSignUp);

indexRouter.get("/code", validators, membersController.getCodePage);

indexRouter.post("/code", codeValidator, membersController.postCodePage);

module.exports = indexRouter;
