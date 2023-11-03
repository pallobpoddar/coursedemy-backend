const { body, param } = require("express-validator");

const userValidator = {
	userUpdate: [
		param("id").isMongoId().withMessage("Invalid MongoDB Id"),
		body("name")
			.optional()
			.isString()
			.withMessage("Invalid name")
			.bail()
			.trim()
			.notEmpty()
			.withMessage("Name is required")
			.bail()
			.isLength({ max: 30 })
			.withMessage("Character limit exceeded"),
		body("image").optional().isURL().withMessage("Invalid URL"),
	],

	userDelete: [param("id").isMongoId().withMessage("Invalid MongoDB Id")],
};

module.exports = userValidator;
