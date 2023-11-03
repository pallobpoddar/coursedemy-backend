const express = require("express");
const userRoutes = express();
const userController = require("../controller/userController");
const userValidator = require("../middleware/userValidation");
const {
	isAuthenticated,
	isAuthorized,
} = require("../middleware/tokenValidation");

userRoutes.get("/all", isAuthenticated, isAuthorized, userController.getAll);
userRoutes.patch(
	"/update-one-by-id/:id",
	isAuthenticated,
	isAuthorized,
	userValidator.userUpdate,
	userController.updateOneByID
);
userRoutes.delete(
	"/delete-one-by-id/:id",
	isAuthenticated,
	isAuthorized,
	userValidator.userDelete,
	userController.deleteOneByID
);

module.exports = userRoutes;
