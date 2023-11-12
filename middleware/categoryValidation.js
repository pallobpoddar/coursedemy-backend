const { body } = require("express-validator");

const categoryValidator = {
	create: [
		body("name")
			.exists()
			.bail()
			.withMessage("Name is required")
			.isString()
			.withMessage("Invalid name")
			.bail()
			.trim()
			.notEmpty()
			.withMessage("Name is required")
			.bail()
			.isLength({ max: 50 })
			.withMessage("Character limit exceeded"),
		body("subcategory")
			.exists()
			.bail()
			.withMessage("Subcategory is required")
			.isString()
			.withMessage("Invalid subcategory")
			.bail()
			.trim()
			.notEmpty()
			.withMessage("Subcategory is required")
			.bail()
			.isLength({ max: 50 })
			.withMessage("Character limit exceeded"),
	],
};

module.exports = categoryValidator;
