const { validationResult } = require("express-validator");
const authModel = require("../models/auth");
const instructorModel = require("../models/instructor");
const sendResponse = require("../utils/commonResponse");
const HTTP_STATUS = require("../constants/statusCodes");

class InstructorController {
	async create(req, res) {
		try {
			const allowedProperties = ["name", "email"];
			const unexpectedProps = Object.keys(req.body).filter(
				(key) => !allowedProperties.includes(key)
			);
			if (unexpectedProps.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to create an instructor profile",
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

			const { name, email } = req.body;

			const auth = await authModel.findOne({ email: email });
			if (!auth) {
				return sendResponse(
					res,
					HTTP_STATUS.NOT_FOUND,
					"Email is not registered",
					"Not found"
				);
			}

			const isInstructorRegistered = await instructorModel.findOne({
				email: email,
			});
			if (isInstructorRegistered) {
				return sendResponse(
					res,
					HTTP_STATUS.NOT_FOUND,
					"Instructor is already registered",
					"Not found"
				);
			}

			const instructor = await instructorModel.create({
				email: email,
				name: name,
			});

			auth.instructorReference = instructor._id;
			await auth.save();

			const filteredInfo = await authModel
				.findOne({ email: email })
				.populate("learnerReference", "-createdAt -updatedAt -__v ")
				.populate("instructorReference", "-createdAt -updatedAt -__v ")
				.populate("adminReference", "-createdAt -updatedAt -__v ")
				.select(
					"-email -password -signInFailed -forgotEmailSent -verificationEmailSent -signInBlockedUntil -resetPasswordToken -emailVerificationToken -emailVerificationValidUntil -createdAt -updatedAt -__v"
				);

			return sendResponse(
				res,
				HTTP_STATUS.OK,
				"Successfully created an instructor profile",
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

	async getAll(req, res) {
		try {
			const instructors = await instructorModel
				.find({})
				.select("-createdAt -updatedAt -__v");

			if (instructors.length === 0) {
				return sendResponse(
					res,
					HTTP_STATUS.OK,
					"No instructor is found"
				);
			}

			return sendResponse(
				res,
				HTTP_STATUS.OK,
				"Successfully received all instructors",
				{
					result: instructors,
					total: instructors.length,
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

			const learner = await instructorModel
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

			const userInfo = await instructorModel.findById({ _id: id });
			if (!userInfo) {
				return sendResponse(
					res,
					HTTP_STATUS.NOT_FOUND,
					"Learner is not registered",
					"Not found"
				);
			}

			const learner = await instructorModel.findByIdAndDelete({
				_id: id,
			});
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

module.exports = new InstructorController();
