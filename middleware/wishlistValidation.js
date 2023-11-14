const { body } = require("express-validator");

const wishlistValidator = {
	addCourse: [
		body("learnerReference")
			.exists()
			.withMessage("Learner reference is required")
			.bail()
			.isMongoId()
			.withMessage("Invalid MongoDB Id"),
		body("courseReference")
			.exists()
			.withMessage("Course reference is required")
			.bail()
			.isMongoId()
			.withMessage("Invalid MongoDB Id"),
	],
};

module.exports = wishlistValidator;
