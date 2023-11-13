const { body } = require("express-validator");

const quizQuestionValidator = {
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
		body("passMarks")
			.exists()
			.withMessage("Pass marks is required")
			.bail()
			.isNumeric()
			.withMessage("Invalid pass marks"),
	],
};

module.exports = quizQuestionValidator;
