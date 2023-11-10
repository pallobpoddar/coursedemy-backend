const { body } = require("express-validator");

const courseValidator = {
	create: [
		body("title")
			.exists()
			.withMessage("Title is required")
			.isString()
			.withMessage("Invalid title")
			.bail()
			.trim()
			.notEmpty()
			.withMessage("Title is required")
			.bail()
			.isLength({ max: 100 })
			.withMessage("Character limit exceeded"),
		body("description")
			.exists()
			.withMessage("Description is required")
			.isString()
			.withMessage("Invalid description")
			.bail()
			.trim()
			.notEmpty()
			.withMessage("Description is required")
			.bail()
			.isLength({ max: 2000 })
			.withMessage("Character limit exceeded"),
		body("language")
			.exists()
			.withMessage("Language is required")
			.isString()
			.withMessage("Invalid language")
			.bail()
			.trim()
			.notEmpty()
			.withMessage("Language is required")
			.bail()
			.isLength({ max: 50 })
			.withMessage("Language limit exceeded"),
	],
};

module.exports = courseValidator;
