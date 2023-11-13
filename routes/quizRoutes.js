const express = require("express");
const quizRoutes = express();
const quizController = require("../controllers/quizController");
const quizValidator = require("../middleware/quizValidation");
const {
	isAuthenticated,
	isAdmin,
	isInstructorOrAdmin,
} = require("../middleware/tokenValidation");

quizRoutes.post(
	"/create",
	isAuthenticated,
	isInstructorOrAdmin,
	quizValidator.create,
	quizController.create
);

module.exports = quizRoutes;
