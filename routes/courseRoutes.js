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

courseRoutes.patch(
	"/update-one-by-id/:id",
	isAuthenticated,
	isInstructorOrAdmin,
	upload.fields([{ name: "thumbnail" }, { name: "promoVideo" }]),
	courseValidator.update,
	courseController.updateOneById
);

module.exports = courseRoutes;
