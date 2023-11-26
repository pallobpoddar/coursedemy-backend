const { validationResult } = require("express-validator");
const courseModel = require("../models/course");
const sectionModel = require("../models/section");
const lectureModel = require("../models/lecture");
const sendResponse = require("../utils/commonResponse");
const HTTP_STATUS = require("../constants/statusCodes");

class SectionController {
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
					"Failed to create the section",
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

			const section = await sectionModel.create({
				courseReference: courseReference,
				title: title,
			});

			const filteredInfo = section.toObject();
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
					"Failed to receive the sections",
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

			const sections = await sectionModel
				.find({
					courseReference: courseReference,
				})
				.populate(
					"lectures",
					"-sectionReference -createdAt -updatedAt -__v"
				)
				.select("-courseReference -createdAt -updatedAt -__v");
			if (sections.length === 0) {
				return sendResponse(
					res,
					HTTP_STATUS.OK,
					"No section has been found"
				);
			}

			return sendResponse(
				res,
				HTTP_STATUS.OK,
				"Successfully received all sections",
				{
					result: sections,
					total: sections.length,
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

	async updateOneById(req, res) {
		try {
			const allowedProperties = ["id", "title"];
			const unexpectedProps = Object.keys(req.params).filter(
				(key) => !allowedProperties.includes(key)
			);
			if (unexpectedProps.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to update the section",
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

			const { id, title } = req.body;

			const section = await sectionModel
				.findById({
					_id: id,
				})
				.select("-createdAt -__v");
			if (!section) {
				return sendResponse(
					res,
					HTTP_STATUS.UNAUTHORIZED,
					"Section is not registered",
					"Unauthorized"
				);
			}

			section.title = title;
			await section.save();

			const filteredInfo = section.toObject();
			delete filteredInfo.updatedAt;

			return sendResponse(
				res,
				HTTP_STATUS.OK,
				"Successfully updated the section",
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

	async deleteOneById(req, res) {
		try {
			const validation = validationResult(req).array();
			if (validation.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					validation[0].msg,
					validation
				);
			}

			const { id } = req.params;

			const lectures = await lectureModel.deleteMany({
				sectionReference: id,
			});

			const section = await sectionModel.findByIdAndDelete({
				_id: id,
			});
			if (!section) {
				return sendResponse(
					res,
					HTTP_STATUS.UNAUTHORIZED,
					"Section is not registered",
					"Unauthorized"
				);
			}

			return sendResponse(
				res,
				HTTP_STATUS.OK,
				"Successfully deleted the section"
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

module.exports = new SectionController();
