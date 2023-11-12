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
				Bucket: "pallob-inception-bucket/final-project",
				Key: req.file.originalname,
				Body: req.file.buffer,
			};
			const content = await uploadToS3(params);

			const lecture = await lectureModel.create({
				title: title,
				content: content,
			});

			section.lectures.push(lecture._id);
			await section.save();

			const filteredInfo = lecture.toObject();
			delete filteredInfo.createdAt;
			delete filteredInfo.updatedAt;
			delete filteredInfo.__v;

			return sendResponse(
				res,
				HTTP_STATUS.OK,
				"Successfully created the section",
				filteredInfo
			);
		} catch (error) {
			console.log(error);
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
