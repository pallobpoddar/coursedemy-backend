const { body } = require("express-validator");

const validateEmail = (message) => {
	return body("email")
		.exists()
		.withMessage("Email is required")
		.bail()
		.isEmail()
		.withMessage(message);
};

const validatePassword = (message) => {
	return body("password")
		.exists()
		.withMessage("Password is required")
		.bail()
		.isLength({ max: 20 })
		.withMessage(message)
		.bail()
		.isStrongPassword({
			minLength: 8,
			minLowercase: 1,
			minUppercase: 1,
			minSymbols: 1,
			minNumbers: 1,
		})
		.withMessage(message);
};

const authValidator = {
	signup: [
		validateEmail("Invalid email"),
		validatePassword("Invalid password"),
		body("confirmPassword")
			.exists()
			.withMessage("Confirm password is required")
			.bail()
			.custom((value, { req }) => {
				if (value !== req.body.password) {
					throw new Error("Passwords don't match");
				}
				return true;
			}),
		body("name")
			.exists()
			.withMessage("Name is required")
			.bail()
			.isString()
			.withMessage("Invalid name")
			.bail()
			.trim()
			.notEmpty()
			.withMessage("Name is required")
			.bail()
			.isLength({ max: 30 })
			.withMessage("Character limit exceeded"),
		body("role")
			.exists()
			.withMessage("Role is required")
			.bail()
			.isIn(["learner", "instructor", "admin"])
			.withMessage("Invalid role"),
	],

	signin: [
		validateEmail("Incorrect email or password"),
		validatePassword("Incorrect email or password"),
	],

	forgotPassword: [validateEmail("Invalid email")],
};

module.exports = authValidator;
