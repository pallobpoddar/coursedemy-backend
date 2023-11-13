const { validationResult } = require("express-validator");
const courseModel = require("../models/course");
const reviewModel = require("../models/review");
const sendResponse = require("../utils/commonResponse");
const HTTP_STATUS = require("../constants/statusCodes");

class ReviewController {
	async create(req, res) {
		try {
			const allowedProperties = [
				"courseReference",
				"learnerReference",
				"rating",
				"review",
			];
			const unexpectedProps = Object.keys(req.body).filter(
				(key) => !allowedProperties.includes(key)
			);
			if (unexpectedProps.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to create the review",
					`Unexpected properties: ${unexpectedProps.join(", ")}`
				);
			}

			const validation = validationResult(req).array();
			if (validation.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to create the review",
					validation
				);
			}

			const { courseReference, learnerReference, rating, review } =
				req.body;

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

			const reviewObject = await reviewModel.create({
				courseReference: courseReference,
				learnerReference: learnerReference,
				rating: rating,
				review: review,
			});

			const filteredInfo = reviewObject.toObject();
			delete filteredInfo.createdAt;
			delete filteredInfo.updatedAt;
			delete filteredInfo.__v;

			return sendResponse(
				res,
				HTTP_STATUS.OK,
				"Successfully created the review",
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

module.exports = new ReviewController();
