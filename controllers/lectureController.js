const { validationResult } = require("express-validator");
const sectionModel = require("../models/section");
const lectureModel = require("../models/lecture");
const sendResponse = require("../utils/commonResponse");
const HTTP_STATUS = require("../constants/statusCodes");
const { uploadToS3 } = require("../configs/file");

class LectureController {
	async create(req, res) {
		try {
			const allowedProperties = ["sectionReference", "title"];
			const unexpectedProps = Object.keys(req.body).filter(
				(key) => !allowedProperties.includes(key)
			);
			if (unexpectedProps.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to create the lecture",
					`Unexpected properties: ${unexpectedProps.join(", ")}`
				);
			}

			const validation = validationResult(req).array();
			if (validation.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to create the lecture",
					validation
				);
			}

			const { sectionReference, title } = req.body;

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

			const params = {
				Bucket: `pallob-inception-bucket/final-project/${req.awsFolder}`,
				Key: req.file.originalname,
				Body: req.file.buffer,
			};
			const content = await uploadToS3(params);

			const lecture = await lectureModel.create({
				sectionReference: sectionReference,
				title: title,
				content: content,
			});

			const filteredInfo = lecture.toObject();
			delete filteredInfo.createdAt;
			delete filteredInfo.updatedAt;
			delete filteredInfo.__v;

			return sendResponse(
				res,
				HTTP_STATUS.OK,
				"Successfully created the lecture",
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

	async updateOneById(req, res) {
		try {
			const allowedProperties = [
				"lectureReference",
				"title",
				"isAccessibleToUnsubsribedLearners",
			];
			const unexpectedProps = Object.keys(req.body).filter(
				(key) => !allowedProperties.includes(key)
			);
			if (unexpectedProps.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to update the lecture",
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

			const { lectureReference, title, isAccessibleToUnsubsribedLearners } =
				req.body;

			if (!title && !isAccessibleToUnsubsribedLearners) {
				return sendResponse(
					res,
					HTTP_STATUS.BAD_REQUEST,
					"Invalid request",
					"Bad request"
				);
			}

			const lecture = await lectureModel
				.findById({
					_id: lectureReference,
				})
				.select("-createdAt -updatedAt -__v");
			if (!lecture) {
				return sendResponse(
					res,
					HTTP_STATUS.UNAUTHORIZED,
					"Lecture is not registered",
					"Unauthorized"
				);
			}

			lecture.title = title;
			lecture.isAccessibleToUnsubsribedLearners =
				isAccessibleToUnsubsribedLearners;
			await lecture.save();

			const filteredInfo = lecture.toObject();
			delete filteredInfo.updatedAt;

			return sendResponse(
				res,
				HTTP_STATUS.OK,
				"Successfully updated the lecture",
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

	async uploadContent(req, res) {
		try {
			const allowedProperties = ["lectureReference"];
			const unexpectedProps = Object.keys(req.body).filter(
				(key) => !allowedProperties.includes(key)
			);
			if (unexpectedProps.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to upload the content",
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

			const { lectureReference } = req.body;

			const lecture = await lectureModel
				.findById({
					_id: lectureReference,
				})
				.select("-createdAt -__v");
			if (!lecture) {
				return sendResponse(
					res,
					HTTP_STATUS.UNAUTHORIZED,
					"Lecture is not registered",
					"Unauthorized"
				);
			}

			const params = {
				Bucket: `pallob-inception-bucket/final-project/${req.awsFolder}`,
				Key: req.file.originalname,
				Body: req.file.buffer,
			};
			const content = await uploadToS3(params);

			lecture.content = content;
			await lecture.save();

			const filteredInfo = lecture.toObject();
			delete filteredInfo.updatedAt;

			return sendResponse(
				res,
				HTTP_STATUS.OK,
				"Successfully uploaded the lecture",
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

module.exports = new LectureController();
