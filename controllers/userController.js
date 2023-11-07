const { validationResult } = require("express-validator");
const userModel = require("../models/user");
const authModel = require("../models/auth");
const sendResponse = require("../utils/commonResponse");
const HTTP_STATUS = require("../constants/statusCodes");

class UserController {
	async getAll(req, res) {
		try {
			const users = await userModel
				.find({})
				.select("-createdAt -updatedAt -__v");

			if (users.length === 0) {
				return sendResponse(res, HTTP_STATUS.OK, "No user is found");
			}

			return sendResponse(
				res,
				HTTP_STATUS.OK,
				"Successfully received all users",
				{
					result: users,
					total: users.length,
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
					"Failed to sign in",
					`Unexpected properties: ${unexpectedProps.join(", ")}`
				);
			}

			const validation = validationResult(req).array();
			if (validation.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to update the user",
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

			const user = await userModel
				.findByIdAndUpdate(
					{ _id: id },
					{
						name: name,
						image: image,
					},
					{ new: true }
				)
				.select("-createdAt -updatedAt -__v");

			if (!user) {
				return sendResponse(
					res,
					HTTP_STATUS.NOT_FOUND,
					"User is not registered",
					"Not found"
				);
			}

			return sendResponse(
				res,
				HTTP_STATUS.OK,
				"Successfully updated the user",
				user
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
					"Failed to delete the user",
					validation
				);
			}

			const { id } = req.params;

			const userInfo = await userModel.findById({ _id: id });
			if (!userInfo) {
				return sendResponse(
					res,
					HTTP_STATUS.NOT_FOUND,
					"User is not registered",
					"Not found"
				);
			}

			const user = await userModel.findByIdAndDelete({ _id: id });
			const authInfo = await authModel.findOneAndDelete({
				email: userInfo.email,
			});

			return sendResponse(
				res,
				HTTP_STATUS.OK,
				`Successfully deleted the user with ${id} id`
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

module.exports = new UserController();
