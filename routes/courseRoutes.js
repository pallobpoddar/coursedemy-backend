const express = require("express");
const courseRoutes = express();
const courseController = require("../controllers/courseController");
const courseValidator = require("../middleware/courseValidation");
const fileValidator = require("../middleware/fileValidation");
const { upload } = require("../configs/file");
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

courseRoutes.get(
	"/get-all-by-instructor-reference/:instructorReference",
	isInstructorOrAdmin,
	courseValidator.getAllByInstructorReference,
	courseController.getAllByInstructorReference
);

courseRoutes.get(
	"/get-one-by-course-reference/:courseReference",
	isInstructorOrAdmin,
	courseValidator.getOneByCourseReference,
	courseController.getOneByCourseReference
);

courseRoutes.patch(
	"/update-one-by-id/:id",
	isAuthenticated,
	isInstructorOrAdmin,
	upload.fields([{ name: "thumbnail" }, { name: "promoVideo" }]),
	courseValidator.update,
	courseController.updateOneById
);

module.exports = courseRoutes;
