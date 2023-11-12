const { body } = require("express-validator");

const lectureValidator = {
	create: [
		body("sectionReference")
			.exists()
			.withMessage("Section reference is required")
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
	],
};

module.exports = lectureValidator;
