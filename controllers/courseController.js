const { validationResult } = require("express-validator");
const courseModel = require("../models/course");
const categoryModel = require("../models/category");
const subcategoryModel = require("../models/subcategory");
const instructorModel = require("../models/instructor");
const sendResponse = require("../utils/commonResponse");
const HTTP_STATUS = require("../constants/statusCodes");

const allowedProperties = [
	"instructorReference",
	"title",
	"categoryReference",
	"subcategoryReference",
];

class CourseController {
	async create(req, res) {
		try {
			const unexpectedProps = Object.keys(req.body).filter(
				(key) => !allowedProperties.includes(key)
			);
			if (unexpectedProps.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to create the course",
					`Unexpected properties: ${unexpectedProps.join(", ")}`
				);
			}

			const validation = validationResult(req).array();
			if (validation.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to create the course",
					validation
				);
			}

			const {
				instructorReference,
				title,
				categoryReference,
				subcategoryReference,
			} = req.body;

			const instructor = await instructorModel.findById({
				_id: instructorReference,
			});
			if (!instructor) {
				return sendResponse(
					res,
					HTTP_STATUS.UNAUTHORIZED,
					"Instructor is not registered",
					"Unauthorized"
				);
			}

			const category = await categoryModel.findById({
				_id: categoryReference,
			});
			if (!category) {
				return sendResponse(
					res,
					HTTP_STATUS.UNAUTHORIZED,
					"Category is not registered",
					"Unauthorized"
				);
			}

			const subcategory = await subcategoryModel.findOne({
				_id: subcategoryReference,
			});
			if (!subcategory) {
				return sendResponse(
					res,
					HTTP_STATUS.UNAUTHORIZED,
					"Subcategory is not registered",
					"Unauthorized"
				);
			}

			const course = await courseModel.create({
				instructorReference: instructorReference,
				title: title,
				categoryReference: categoryReference,
				subcategoryReference: subcategoryReference,
			});

			const filteredInfo = course.toObject();
			delete filteredInfo.createdAt;
			delete filteredInfo.updatedAt;
			delete filteredInfo.__v;

			return sendResponse(
				res,
				HTTP_STATUS.OK,
				"Successfully created the course",
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
			const unexpectedProps = Object.keys(req.body).filter(
				(key) => !allowedProperties.includes(key)
			);
			if (unexpectedProps.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to create the course",
					`Unexpected properties: ${unexpectedProps.join(", ")}`
				);
			}

			const validation = validationResult(req).array();
			if (validation.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to create the course",
					validation
				);
			}

			const { id } = req.params;
			const {
				instructorReference,
				title,
				categoryReference,
				subcategoryReference,
			} = req.body;

			if (
				!instructorReference &&
				!title &&
				!categoryReference &&
				!subcategoryReference
			) {
				return sendResponse(
					res,
					HTTP_STATUS.BAD_REQUEST,
					"Invalid request",
					"Bad request"
				);
			}

			const course = await courseModel
				.findByIdAndUpdate(
					{ _id: id },
					{
						instructorReference: instructorReference,
						title: title,
						categoryReference: categoryReference,
						subcategoryReference: subcategoryReference,
					},
					{ new: true }
				)
				.select("-createdAt -updatedAt -__v");

			if (!course) {
				return sendResponse(
					res,
					HTTP_STATUS.NOT_FOUND,
					"Course is not registered",
					"Not found"
				);
			}

			return sendResponse(
				res,
				HTTP_STATUS.OK,
				"Successfully updated the course",
				book
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

module.exports = new CourseController();
