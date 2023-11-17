const { body } = require("express-validator");

const authValidator = {
	signup: [
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
			.isLength({ max: 255 })
			.withMessage("Character limit exceeded"),
		body("email")
			.exists()
			.withMessage("Email is required")
			.bail()
			.isEmail()
			.withMessage("Invalid email"),
		body("password")
			.exists()
			.withMessage("Password is required")
			.bail()
			.isLength({ max: 20 })
			.withMessage("Character limit exceeded")
			.bail()
			.isStrongPassword({
				minLength: 8,
				minLowercase: 1,
				minUppercase: 1,
				minSymbols: 1,
				minNumbers: 1,
			})
			.withMessage(
				"Password must be at least 8 characters long, including lowercase and uppercase letters, symbols and numbers"
			),
		body("role")
			.exists()
			.withMessage("Role is required")
			.bail()
			.isIn(["admin", "learner", "instructor"])
			.withMessage("Invalid request"),
	],

	signin: [
		body("email")
			.exists()
			.withMessage("Email is required")
			.bail()
			.isEmail()
			.withMessage("Incorrect email or password"),
		body("password")
			.exists()
			.withMessage("Password is required")
			.bail()
			.isLength({ max: 20 })
			.withMessage("Incorrect email or password")
			.bail()
			.isStrongPassword({
				minLength: 8,
				minLowercase: 1,
				minUppercase: 1,
				minSymbols: 1,
				minNumbers: 1,
			})
			.withMessage("Incorrect email or password"),
	],

	emailVerification: [
		body("token")
			.exists()
			.withMessage("Invalid request")
			.bail()
			.isString()
			.withMessage("Invalid request")
			.bail()
			.trim()
			.notEmpty()
			.withMessage("Invalid request")
			.bail()
			.isLength({ max: 255 })
			.withMessage("Character limit exceeded"),
		body("id")
			.exists()
			.withMessage("Id is required")
			.bail()
			.isMongoId()
			.withMessage("Invalid MongoDB Id"),
	],

	forgotPassword: [
		body("email")
			.exists()
			.withMessage("Email is required")
			.bail()
			.isEmail()
			.withMessage("Invalid email"),
	],

	resetPassword: [
		body("token")
			.exists()
			.withMessage("Invalid request")
			.bail()
			.isString()
			.withMessage("Invalid request")
			.bail()
			.trim()
			.notEmpty()
			.withMessage("Invalid request")
			.bail()
			.isLength({ max: 255 })
			.withMessage("Character limit exceeded"),
		body("id")
			.exists()
			.withMessage("Id is required")
			.bail()
			.isMongoId()
			.withMessage("Invalid MongoDB Id"),
		body("password")
			.exists()
			.withMessage("Password is required")
			.bail()
			.isLength({ max: 20 })
			.withMessage("Incorrect email or password")
			.bail()
			.isStrongPassword({
				minLength: 8,
				minLowercase: 1,
				minUppercase: 1,
				minSymbols: 1,
				minNumbers: 1,
			})
			.withMessage("Incorrect email or password"),
		body("confirmPassword")
			.exists()
			.withMessage("Confirm password is required")
			.bail()
			.isLength({ max: 20 })
			.withMessage("Character limit exceeded")
			.bail()
			.isStrongPassword({
				minLength: 8,
				minLowercase: 1,
				minUppercase: 1,
				minSymbols: 1,
				minNumbers: 1,
			})
			.withMessage(
				"Password must be at least 8 characters long, including lowercase and uppercase letters, symbols and numbers"
			)
			.custom((value, { req }) => {
				if (value !== req.body.password) {
					throw new Error("Passwords do not match");
				}
				return true;
			}),
	],
};

module.exports = authValidator;
