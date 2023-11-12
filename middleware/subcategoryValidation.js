const { body } = require("express-validator");

const subcategoryValidator = {
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
	],
};

module.exports = subcategoryValidator;
