const express = require("express");
const lectureRoutes = express();
const lectureController = require("../controllers/lectureController");
const lectureValidator = require("../middleware/lectureValidation");
const fileValidator = require("../middleware/fileValidation");
const { upload } = require("../configs/file");
const {
	isAuthenticated,
	isAdmin,
	isInstructorOrAdmin,
} = require("../middleware/tokenValidation");

lectureRoutes.post(
	"/create",
	isAuthenticated,
	isInstructorOrAdmin,
	upload.single("fileInput"),
	fileValidator.uploadFile,
	lectureValidator.create,
	lectureController.create
);

lectureRoutes.patch(
	"/update-one-by-id",
	isAuthenticated,
	isInstructorOrAdmin,
	lectureValidator.updateOneById,
	lectureController.updateOneById
);

lectureRoutes.patch(
	"/upload-content",
	isAuthenticated,
	isInstructorOrAdmin,
	upload.single("content"),
	fileValidator.uploadFile,
	lectureValidator.uploadContent,
	lectureController.uploadContent
);

module.exports = lectureRoutes;
