const { body } = require("express-validator");

const reviewValidator = {
	create: [
		body("courseReference")
			.exists()
			.withMessage("Course reference is required")
			.bail()
			.isMongoId()
			.withMessage("Invalid MongoDB Id"),
		body("learnerReference")
			.exists()
			.withMessage("Learner reference is required")
			.bail()
			.isMongoId()
			.withMessage("Invalid MongoDB Id"),
		body("rating")
			.exists()
			.withMessage("Rating is required")
			.bail()
			.isNumeric({ max: 5 })
			.withMessage("Invalid rating"),
		body("review")
			.exists()
			.withMessage("Review is required")
			.bail()
			.isString()
			.withMessage("Invalid review")
			.bail()
			.trim()
			.notEmpty()
			.withMessage("Review is required")
			.bail()
			.isLength({ max: 1000 })
			.withMessage("Character limit exceeded"),
	],
};

module.exports = reviewValidator;
