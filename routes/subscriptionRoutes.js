const express = require("express");
const subscriptionRoutes = express();
const subscriptionController = require("../controllers/subscriptionController");
const subscriptionValidator = require("../middleware/subscriptionValidation");
const {
	isAuthenticated,
	isAdmin,
	isLearnerOrAdmin,
} = require("../middleware/tokenValidation");

subscriptionRoutes.post(
	"/create",
	isAuthenticated,
	isLearnerOrAdmin,
	subscriptionValidator.create,
	subscriptionController.create
);

module.exports = subscriptionRoutes;
