const express = require("express");
const lectureRoutes = express();
const lectureController = require("../controllers/lectureController");
const lectureValidator = require("../middleware/lectureValidation");
const { s3, upload } = require("../configs/file");
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
	lectureValidator.create,
	lectureController.create
);

module.exports = lectureRoutes;
