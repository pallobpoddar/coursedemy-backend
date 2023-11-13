const express = require("express");
const quizQuestionRoutes = express();
const quizQuestionController = require("../controllers/quizQuestionController");
const quizQuestionValidator = require("../middleware/quizQuestionValidation");
const {
	isAuthenticated,
	isAdmin,
	isInstructorOrAdmin,
} = require("../middleware/tokenValidation");

quizQuestionRoutes.post(
	"/create",
	isAuthenticated,
	isInstructorOrAdmin,
	quizQuestionValidator.create,
	quizQuestionController.create
);

module.exports = quizQuestionRoutes;
