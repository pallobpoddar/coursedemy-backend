const express = require("express");
const learnerRoutes = express();
const learnerController = require("../controllers/learnerController");
const learnerValidator = require("../middleware/userValidation");
const {
	isAuthenticated,
	isAdmin,
	isLearnerOrAdmin,
} = require("../middleware/tokenValidation");

learnerRoutes.get("/all", isAuthenticated, isAdmin, learnerController.getAll);
learnerRoutes.patch(
	"/update-one-by-id/:id",
	isAuthenticated,
	isLearnerOrAdmin,
	learnerValidator.userUpdate,
	learnerController.updateOneByID
);
learnerRoutes.delete(
	"/delete-one-by-id/:id",
	isAuthenticated,
	isLearnerOrAdmin,
	learnerValidator.userDelete,
	learnerController.deleteOneByID
);

module.exports = learnerRoutes;
