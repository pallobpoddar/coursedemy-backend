const express = require("express");
const sectionRoutes = express();
const sectionController = require("../controllers/sectionController");
const sectionValidator = require("../middleware/sectionValidation");
const {
	isAuthenticated,
	isAdmin,
	isInstructorOrAdmin,
} = require("../middleware/tokenValidation");

sectionRoutes.post(
	"/create",
	isAuthenticated,
	isInstructorOrAdmin,
	sectionValidator.create,
	sectionController.create
);

module.exports = sectionRoutes;
