const express = require("express");
const courseRoutes = express();
const courseController = require("../controllers/courseController");
const courseValidator = require("../middleware/userValidation");
const {
	isAuthenticated,
	isAdmin,
	isLearnerOrAdmin,
} = require("../middleware/tokenValidation");

module.exports = courseRoutes;
