const express = require("express");
const cartRoutes = express();
const cartController = require("../controllers/cartController");
const cartValidator = require("../middleware/cartValidation");
const {
	isAuthenticated,
	isAdmin,
	isLearnerOrAdmin,
} = require("../middleware/tokenValidation");

cartRoutes.post(
	"/add-course",
	isAuthenticated,
	isLearnerOrAdmin,
	cartValidator.addCourse,
	cartController.addCourse
);

module.exports = cartRoutes;
