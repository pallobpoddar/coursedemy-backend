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

sectionRoutes.patch(
	"/update-one-by-id",
	isAuthenticated,
	isInstructorOrAdmin,
	sectionValidator.updateOneById,
	sectionController.updateOneById
);

sectionRoutes.delete(
	"/delete-one-by-id/:id",
	isAuthenticated,
	isInstructorOrAdmin,
	sectionValidator.deleteOneById,
	sectionController.deleteOneById
);

module.exports = sectionRoutes;
