const { validationResult } = require("express-validator");
const authModel = require("../models/auth");
const learnerModel = require("../models/learner");
const sendResponse = require("../utils/commonResponse");
const HTTP_STATUS = require("../constants/statusCodes");

class LearnerController {
	async getAll(req, res) {
		try {
			const learners = await learnerModel
				.find({})
				.select("-createdAt -updatedAt -__v");

			if (learners.length === 0) {
				return sendResponse(res, HTTP_STATUS.OK, "No learner is found");
			}

			return sendResponse(
				res,
				HTTP_STATUS.OK,
				"Successfully received all learners",
				{
					result: learners,
					total: learners.length,
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

	async updateOneByID(req, res) {
		try {
			const allowedProperties = ["name", "image"];
			const unexpectedProps = Object.keys(req.body).filter(
				(key) => !allowedProperties.includes(key)
			);
			if (unexpectedProps.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to update the learner",
					`Unexpected properties: ${unexpectedProps.join(", ")}`
				);
			}

			const validation = validationResult(req).array();
			if (validation.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to update the learner",
					validation
				);
			}

			const { id } = req.params;
			const { name, image } = req.body;

			if (!name && !image) {
				return sendResponse(
					res,
					HTTP_STATUS.BAD_REQUEST,
					"Invalid request",
					"Bad request"
				);
			}

			const learner = await learnerModel
				.findByIdAndUpdate(
					{ _id: id },
					{
						name: name,
						image: image,
					},
					{ new: true }
				)
				.select("-createdAt -updatedAt -__v");

			if (!learner) {
				return sendResponse(
					res,
					HTTP_STATUS.NOT_FOUND,
					"Learner is not registered",
					"Not found"
				);
			}

			return sendResponse(
				res,
				HTTP_STATUS.OK,
				"Successfully updated the learner",
				learner
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

	async deleteOneByID(req, res) {
		try {
			const validation = validationResult(req).array();
			if (validation.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to delete the learner",
					validation
				);
			}

			const { id } = req.params;

			const userInfo = await learnerModel.findById({ _id: id });
			if (!userInfo) {
				return sendResponse(
					res,
					HTTP_STATUS.NOT_FOUND,
					"Learner is not registered",
					"Not found"
				);
			}

			const learner = await learnerModel.findByIdAndDelete({ _id: id });
			const authInfo = await authModel.findOneAndDelete({
				email: userInfo.email,
			});

			return sendResponse(
				res,
				HTTP_STATUS.OK,
				`Successfully deleted the learner with ${id} id`
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

module.exports = new LearnerController();
