const { body } = require("express-validator");

const quizQuestionValidator = {
	create: [
		body("quizReference")
			.exists()
			.withMessage("Quiz reference is required")
			.bail()
			.isMongoId()
			.withMessage("Invalid MongoDB Id"),
		body("question")
			.exists()
			.withMessage("Question is required")
			.bail()
			.isString()
			.withMessage("Invalid Question")
			.bail()
			.trim()
			.notEmpty()
			.withMessage("Question is required")
			.bail()
			.isLength({ max: 1000 })
			.withMessage("Character limit exceeded"),
		body("options")
			.exists()
			.withMessage("Options are required")
			.bail()
			.isArray()
			.withMessage("Invalid options")
			.bail()
			.isLength({ max: 100 })
			.withMessage("Options limit exceeded"),
		body("answer")
			.exists()
			.withMessage("Answer is required")
			.bail()
			.isString()
			.withMessage("Invalid Answer")
			.bail()
			.trim()
			.notEmpty()
			.withMessage("Answer is required")
			.bail()
			.isLength({ max: 100 })
			.withMessage("Character limit exceeded"),
		body("marks")
			.exists()
			.withMessage("Marks is required")
			.bail()
			.isNumeric()
			.withMessage("Invalid marks"),
	],
};

module.exports = quizQuestionValidator;
