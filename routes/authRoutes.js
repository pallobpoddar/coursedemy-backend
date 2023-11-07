const express = require("express");
const authRoutes = express();
const authValidator = require("../middleware/authValidation.js");
const authController = require("../controllers/authController.js");

authRoutes.post("/signup", authValidator.signup, authController.signup);
authRoutes.post("/signin", authValidator.signin, authController.signin);
authRoutes.post(
	"/forgot-password-email",
	authValidator.forgotPassword,
	authController.sendForgotPasswordEmail
);
authRoutes.post("/reset-password", authController.resetPassword);

module.exports = authRoutes;
