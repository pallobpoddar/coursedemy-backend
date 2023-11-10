const { validationResult } = require("express-validator");
const category = require("../models/category");
const subcategory = require("../models/subcategory");
const courseModel = require("../models/course");
const sendResponse = require("../utils/commonResponse");
const HTTP_STATUS = require("../constants/statusCodes");

class CourseController {
	async create(req, res) {
		try {
			const allowedProperties = [
				"title",
				"description",
				"language",
				"section",
				"category",
				"subcategory",
			];
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

			const { title, description, language, category, subcategory } = req.body;

			const subcategoryInfo = await subcategory.findOne({
				name: subcategory,
			});
			if (!subcategoryInfo) {
				return sendResponse(
					res,
					HTTP_STATUS.UNAUTHORIZED,
					"Subcategory is not registered",
					"Unauthorized"
				);
			}

			const categoryInfo = await category.findOne({
				name: category,
			});
			if (!categoryInfo) {
				return sendResponse(
					res,
					HTTP_STATUS.UNAUTHORIZED,
					"Category is not registered",
					"Unauthorized"
				);
			}

			const course = await courseModel.create({
				title: title,
				description: description,
				language: language,
				category: categoryInfo._id,
			});

			const filteredInfo = course.toObject();
			delete filteredInfo.createdAt;
			delete filteredInfo.updatedAt;
			delete filteredInfo.__v;
		} catch (error) {}
	}
}
