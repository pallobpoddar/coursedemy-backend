const express = require("express");
const reviewRoutes = express();
const reviewController = require("../controllers/reviewController");
const reviewValidator = require("../middleware/reviewValidation");
const {
	isAuthenticated,
	isAdmin,
	isLearnerOrAdmin,
} = require("../middleware/tokenValidation");

reviewRoutes.post(
	"/create",
	isAuthenticated,
	isLearnerOrAdmin,
	reviewValidator.create,
	reviewController.create
);

module.exports = reviewRoutes;
