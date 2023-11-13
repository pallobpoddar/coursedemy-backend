const { validationResult } = require("express-validator");
const courseModel = require("../models/course");
const learnerModel = require("../models/learner");
const subscriptionModel = require("../models/subscription");
const sendResponse = require("../utils/commonResponse");
const HTTP_STATUS = require("../constants/statusCodes");

class SubscriptionController {
	async create(req, res) {
		try {
			const allowedProperties = ["learnerReference", "courseReference"];
			const unexpectedProps = Object.keys(req.body).filter(
				(key) => !allowedProperties.includes(key)
			);
			if (unexpectedProps.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to create the subscription",
					`Unexpected properties: ${unexpectedProps.join(", ")}`
				);
			}

			const validation = validationResult(req).array();
			if (validation.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to create the subscription",
					validation
				);
			}

			const { learnerReference, courseReference } = req.body;

			const learner = await learnerModel.findById({
				_id: learnerReference,
			});
			if (!learner) {
				return sendResponse(
					res,
					HTTP_STATUS.UNAUTHORIZED,
					"Learner is not registered",
					"Unauthorized"
				);
			}

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

			const subscription = await subscriptionModel.create({
				learnerReference: learnerReference,
				courseReference: courseReference,
			});

			const filteredInfo = subscription.toObject();
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
}

module.exports = new SubscriptionController();
