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

sectionRoutes.get(
	"/get-all-by-course-reference/:courseReference",
	isAuthenticated,
	isInstructorOrAdmin,
	sectionValidator.getAllByCourseReference,
	sectionController.getAllByCourseReference
);

module.exports = sectionRoutes;
