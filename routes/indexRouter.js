const { Router } = require("express");
const indexRouter = Router();
const membersController = require("../controllers/membersController");
// validators must be destructured
const { validators } = require("../middleware/validators");

indexRouter.get("/", membersController.getHomePage);

indexRouter.get("/sign-up", membersController.getSignUp);

indexRouter.post("/sign-up", validators, membersController.postSignUp);

indexRouter.get("/code", validators, membersController.getCodePage);

indexRouter.post("/code", membersController.postCodePage);

module.exports = indexRouter;
