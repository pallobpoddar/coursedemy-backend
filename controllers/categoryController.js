const { validationResult } = require("express-validator");
const categoryModel = require("../models/category");
const subcategoryModel = require("../models/subcategory");
const sendResponse = require("../utils/commonResponse");
const HTTP_STATUS = require("../constants/statusCodes");

class CategoryController {
	async create(req, res) {
		try {
			const allowedProperties = ["name"];
			const unexpectedProps = Object.keys(req.body).filter(
				(key) => !allowedProperties.includes(key)
			);
			if (unexpectedProps.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to create the category",
					`Unexpected properties: ${unexpectedProps.join(", ")}`
				);
			}

			const validation = validationResult(req).array();
			if (validation.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to create the category",
					validation
				);
			}

			const { name } = req.body;
			const categoryInfo = await categoryModel.findOne({
				name: name,
			});
			if (categoryInfo) {
				return sendResponse(
					res,
					HTTP_STATUS.UNAUTHORIZED,
					"Category already exists",
					"Unauthorized"
				);
			}

			const category = await categoryModel.create({
				name: name,
			});

			const filteredInfo = category.toObject();
			delete filteredInfo.createdAt;
			delete filteredInfo.updatedAt;
			delete filteredInfo.__v;

			return sendResponse(
				res,
				HTTP_STATUS.OK,
				"Successfully created the category",
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

module.exports = new CategoryController();
