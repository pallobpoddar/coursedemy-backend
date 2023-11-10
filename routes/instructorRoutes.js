const express = require("express");
const instructorRoutes = express();
const instructorController = require("../controllers/instructorController");
const instructorValidator = require("../middleware/userValidation");
const {
	isAuthenticated,
	isAdmin,
	isInstructorOrAdmin,
} = require("../middleware/tokenValidation");

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
	instructorValidator.userUpdate,
	instructorController.updateOneByID
);
instructorRoutes.delete(
	"/delete-one-by-id/:id",
	isAuthenticated,
	isInstructorOrAdmin,
	instructorValidator.userDelete,
	instructorController.deleteOneByID
);

module.exports = instructorRoutes;
