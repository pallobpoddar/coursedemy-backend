const express = require("express");
const wishlistRoutes = express();
const wishlistController = require("../controllers/wishlistController");
const wishlistValidator = require("../middleware/wishlistValidation");
const {
	isAuthenticated,
	isAdmin,
	isLearnerOrAdmin,
} = require("../middleware/tokenValidation");

wishlistRoutes.post(
	"/add-course",
	isAuthenticated,
	isLearnerOrAdmin,
	wishlistValidator.addCourse,
	wishlistController.addCourse
);

module.exports = wishlistRoutes;
