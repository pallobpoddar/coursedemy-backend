const express = require("express");
const assignmentRoutes = express();
const assignmentController = require("../controllers/assignmentController");
const assignmentValidator = require("../middleware/assignmentValidation");
const fileValidator = require("../middleware/fileValidation");
const { upload } = require("../configs/file");
const {
	isAuthenticated,
	isAdmin,
	isInstructorOrAdmin,
} = require("../middleware/tokenValidation");

assignmentRoutes.post(
	"/create",
	isAuthenticated,
	isInstructorOrAdmin,
	upload.single("assignment"),
	fileValidator.uploadFile,
	assignmentValidator.create,
	assignmentController.create
);

assignmentRoutes.get(
	"/get-all-by-course-reference/:courseReference",
	isAuthenticated,
	isInstructorOrAdmin,
	assignmentValidator.getAllByCourseReference,
	assignmentController.getAllByCourseReference
);

assignmentRoutes.patch(
	"/update-one-by-id",
	isAuthenticated,
	isInstructorOrAdmin,
	upload.single("assignment"),
	fileValidator.uploadFile,
	assignmentValidator.updateOneById,
	assignmentController.updateOneById
);

assignmentRoutes.delete(
	"/delete-one-by-id/:id",
	isAuthenticated,
	isInstructorOrAdmin,
	assignmentValidator.deleteOneById,
	assignmentController.deleteOneById
);

module.exports = assignmentRoutes;
