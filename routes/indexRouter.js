const { Router } = require("express");
const indexRouter = Router();
const membersController = require("../controllers/membersController");

indexRouter.get("/", membersController.getHomePage);

indexRouter.get("/sign-up", membersController.getSignUp);

indexRouter.post("/sign-up", membersController.postSignUp);

module.exports = indexRouter;
