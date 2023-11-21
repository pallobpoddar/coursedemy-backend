const express = require("express");
const instructorRoutes = express();
const instructorController = require("../controllers/instructorController");
const {
	isAuthenticated,
	isAdmin,
	isInstructorOrAdmin,
	isLearnerOrAdmin,
} = require("../middleware/tokenValidation");
const userValidator = require("../middleware/userValidation");

instructorRoutes.post(
	"/create-instructor-profile",
	isAuthenticated,
	isLearnerOrAdmin,
	userValidator.userCreate,
	instructorController.create
);
instructorRoutes.get(
	"/all",
	isAuthenticated,
	isAdmin,
	instructorController.getAll
);
instructorRoutes.patch(
	"/update-one-by-id/:id",
	isAuthenticated,
	isInstructorOrAdmin,
	userValidator.userUpdate,
	instructorController.updateOneByID
);
instructorRoutes.delete(
	"/delete-one-by-id/:id",
	isAuthenticated,
	isInstructorOrAdmin,
	userValidator.userDelete,
	instructorController.deleteOneByID
);

module.exports = instructorRoutes;
