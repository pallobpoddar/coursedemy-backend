const { body } = require("express-validator");

const courseValidator = {
	create: [
		body("instructorReference")
			.exists()
			.withMessage("Instructor reference is required")
			.bail()
			.isMongoId()
			.withMessage("Invalid MongoDB Id"),
		body("title")
			.exists()
			.withMessage("Title is required")
			.bail()
			.isString()
			.withMessage("Invalid title")
			.bail()
			.trim()
			.notEmpty()
			.withMessage("Title is required")
			.bail()
			.isLength({ max: 100 })
			.withMessage("Character limit exceeded"),
		body("category")
			.exists()
			.withMessage("Category is required")
			.bail()
			.isString()
			.withMessage("Invalid category")
			.bail()
			.trim()
			.notEmpty()
			.withMessage("Category is required")
			.bail()
			.isLength({ max: 50 })
			.withMessage("Character limit exceeded"),
	],
};

module.exports = courseValidator;
