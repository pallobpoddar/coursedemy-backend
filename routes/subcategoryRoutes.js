const express = require("express");
const subcategoryRoutes = express();
const subcategoryController = require("../controllers/subcategoryController");
const subcategoryValidator = require("../middleware/subcategoryValidation");
const { isAuthenticated, isAdmin } = require("../middleware/tokenValidation");

subcategoryRoutes.post(
	"/create",
	isAuthenticated,
	isAdmin,
	subcategoryValidator.create,
	subcategoryController.create
);

module.exports = subcategoryRoutes;
