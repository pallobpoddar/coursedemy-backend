const express = require("express");
const courseRoutes = express();
const courseController = require("../controllers/courseController");
const courseValidator = require("../middleware/courseValidation");
const {
	isAuthenticated,
	isAdmin,
	isInstructorOrAdmin,
} = require("../middleware/tokenValidation");

courseRoutes.post(
	"/create",
	isAuthenticated,
	isInstructorOrAdmin,
	courseValidator.create,
	courseController.create
);

module.exports = courseRoutes;
