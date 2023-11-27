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
	courseValidator.crudByCourseReference,
	courseController.getOneByCourseReference
);

courseRoutes.patch(
	"/update-one-by-id",
	isAuthenticated,
	isInstructorOrAdmin,
	courseValidator.updateOneByCourseReference,
	courseController.updateOneByCourseReference
);

courseRoutes.patch(
	"/upload-thumbnail/:courseReference",
	isAuthenticated,
	isInstructorOrAdmin,
	upload.single("thumbnail"),
	fileValidator.uploadFile,
	courseValidator.crudByCourseReference,
	courseController.uploadThumbnail
);

courseRoutes.patch(
	"/upload-promo-video/:courseReference",
	isAuthenticated,
	isInstructorOrAdmin,
	upload.single("promoVideo"),
	fileValidator.uploadFile,
	courseValidator.crudByCourseReference,
	courseController.uploadPromoVideo
);

module.exports = courseRoutes;
