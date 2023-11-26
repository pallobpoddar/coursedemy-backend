const { body, param } = require("express-validator");

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

	updateOneById: [
		body("id")
			.exists()
			.withMessage("Lecture id is required")
			.bail()
			.isMongoId()
			.withMessage("Invalid MongoDB Id"),
		body("title")
			.optional()
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
		body("isAccessibleToUnsubsribedLearners")
			.optional()
			.bail()
			.isBoolean()
			.withMessage("Invalid access criteria"),
	],

	uploadContent: [
		body("lectureReference")
			.exists()
			.withMessage("Lecture reference is required")
			.bail()
			.isMongoId()
			.withMessage("Invalid MongoDB Id"),
	],

	deleteOneById: [
		param("id")
			.exists()
			.withMessage("Lecture id is required")
			.bail()
			.isMongoId()
			.withMessage("Invalid MongoDB Id"),
	],
};

module.exports = lectureValidator;
