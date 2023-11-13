const { validationResult } = require("express-validator");
const quizModel = require("../models/quiz");
const quizQuestionModel = require("../models/quizQuestion");
const sendResponse = require("../utils/commonResponse");
const HTTP_STATUS = require("../constants/statusCodes");

class QuizQuestionController {
	async create(req, res) {
		try {
			const allowedProperties = [
				"quizReference",
				"question",
				"options",
				"answer",
				"marks",
			];
			const unexpectedProps = Object.keys(req.body).filter(
				(key) => !allowedProperties.includes(key)
			);
			if (unexpectedProps.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to create the quiz question",
					`Unexpected properties: ${unexpectedProps.join(", ")}`
				);
			}

			const validation = validationResult(req).array();
			if (validation.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to create the quiz question",
					validation
				);
			}

			const { quizReference, question, options, answer, marks } = req.body;

			const quiz = await quizModel.findById({
				_id: quizReference,
			});
			if (!quiz) {
				return sendResponse(
					res,
					HTTP_STATUS.UNAUTHORIZED,
					"Quiz is not registered",
					"Unauthorized"
				);
			}

			const quizQuestion = await quizQuestionModel.create({
				quizReference: quizReference,
				question: question,
				options: options,
				answer: answer,
				marks: marks,
			});

			const filteredInfo = quizQuestion.toObject();
			delete filteredInfo.createdAt;
			delete filteredInfo.updatedAt;
			delete filteredInfo.__v;

			return sendResponse(
				res,
				HTTP_STATUS.OK,
				"Successfully created the quiz question",
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

module.exports = new QuizQuestionController();
