const { validationResult } = require("express-validator");
const courseModel = require("../models/course");
const assignmentModel = require("../models/assignment");
const sendResponse = require("../utils/commonResponse");
const HTTP_STATUS = require("../constants/statusCodes");
const { uploadToS3 } = require("../configs/file");

class AssignmentController {
	async create(req, res) {
		try {
			const allowedProperties = ["courseReference", "title"];
			const unexpectedProps = Object.keys(req.body).filter(
				(key) => !allowedProperties.includes(key)
			);
			if (unexpectedProps.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to create the assignment",
					`Unexpected properties: ${unexpectedProps.join(", ")}`
				);
			}

			const validation = validationResult(req).array();
			if (validation.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					validation[0].msg,
					validation
				);
			}

			const { courseReference, title } = req.body;

			const course = await courseModel.findById({
				_id: courseReference,
			});
			if (!course) {
				return sendResponse(
					res,
					HTTP_STATUS.UNAUTHORIZED,
					"Course is not registered",
					"Unauthorized"
				);
			}

			const params = {
				Bucket: `pallob-inception-bucket/final-project/${req.awsFolder}`,
				Key: req.file.originalname,
				Body: req.file.buffer,
			};
			const question = await uploadToS3(params);

			const assignment = await assignmentModel.create({
				courseReference: courseReference,
				title: title,
				question: question,
			});

			const filteredInfo = assignment.toObject();
			delete filteredInfo.createdAt;
			delete filteredInfo.updatedAt;
			delete filteredInfo.__v;

			return sendResponse(
				res,
				HTTP_STATUS.OK,
				"Successfully created the assignment",
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

	async getAllByCourseReference(req, res) {
		try {
			const allowedProperties = ["courseReference"];
			const unexpectedProps = Object.keys(req.params).filter(
				(key) => !allowedProperties.includes(key)
			);
			if (unexpectedProps.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to receive the assignments",
					`Unexpected properties: ${unexpectedProps.join(", ")}`
				);
			}

			const validation = validationResult(req).array();
			if (validation.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					validation[0].msg,
					validation
				);
			}

			const { courseReference } = req.params;

			const course = await courseModel.findById({
				_id: courseReference,
			});
			if (!course) {
				return sendResponse(
					res,
					HTTP_STATUS.UNAUTHORIZED,
					"Course is not registered",
					"Unauthorized"
				);
			}

			const assignments = await assignmentModel
				.find({})
				.select("-createdAt -updatedAt -__v");
			if (assignments.length === 0) {
				return sendResponse(
					res,
					HTTP_STATUS.OK,
					"No course has been found"
				);
			}

			return sendResponse(
				res,
				HTTP_STATUS.OK,
				"Successfully received all assignments",
				{
					result: assignments,
					total: assignments.length,
				}
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

module.exports = new AssignmentController();
