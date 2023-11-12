const { validationResult } = require("express-validator");
const subcategoryModel = require("../models/subcategory");
const sendResponse = require("../utils/commonResponse");
const HTTP_STATUS = require("../constants/statusCodes");

class SubcategoryController {
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
					"Failed to create the subcategory",
					`Unexpected properties: ${unexpectedProps.join(", ")}`
				);
			}

			const validation = validationResult(req).array();
			if (validation.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to create the subcategory",
					validation
				);
			}

			const { name } = req.body;
			const subcategoryInfo = await subcategoryModel.findOne({
				name: name,
			});
			if (subcategoryInfo) {
				return sendResponse(
					res,
					HTTP_STATUS.UNAUTHORIZED,
					"Subcategory already exists",
					"Unauthorized"
				);
			}

			const subcategory = await subcategoryModel.create({
				name: name,
			});

			const filteredInfo = subcategory.toObject();
			delete filteredInfo.createdAt;
			delete filteredInfo.updatedAt;
			delete filteredInfo.__v;

			return sendResponse(
				res,
				HTTP_STATUS.OK,
				"Successfully created the subcategory",
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

module.exports = new SubcategoryController();
