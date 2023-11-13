const { validationResult } = require("express-validator");
const sectionModel = require("../models/section");
const quizModel = require("../models/quiz");
const sendResponse = require("../utils/commonResponse");
const HTTP_STATUS = require("../constants/statusCodes");
const { uploadToS3 } = require("../configs/file");

class QuizController {
	async create(req, res) {
		try {
			const allowedProperties = ["sectionReference", "title", "passMarks"];
			const unexpectedProps = Object.keys(req.body).filter(
				(key) => !allowedProperties.includes(key)
			);
			if (unexpectedProps.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to create the quiz",
					`Unexpected properties: ${unexpectedProps.join(", ")}`
				);
			}

			const validation = validationResult(req).array();
			if (validation.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to create the quiz",
					validation
				);
			}

			const { sectionReference, title, passMarks } = req.body;

			const section = await sectionModel.findById({
				_id: sectionReference,
			});
			if (!section) {
				return sendResponse(
					res,
					HTTP_STATUS.UNAUTHORIZED,
					"Section is not registered",
					"Unauthorized"
				);
			}

			const quiz = await quizModel.create({
				sectionReference: sectionReference,
				title: title,
				passMarks: passMarks,
			});

			const filteredInfo = quiz.toObject();
			delete filteredInfo.createdAt;
			delete filteredInfo.updatedAt;
			delete filteredInfo.__v;

			return sendResponse(
				res,
				HTTP_STATUS.OK,
				"Successfully created the quiz",
				filteredInfo
			);
		} catch (error) {
			return sendResponse(
				res,
				HTTP_STATUS.INTERNAL_SERVER_ERROR,
				"Internal server error",
				"Server error"
			);
		}
	}
}

module.exports = new QuizController();
