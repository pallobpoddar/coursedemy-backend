const ejs = require("ejs");
const path = require("path");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { promisify } = require("util");
const jsonwebtoken = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const ejsRenderFile = promisify(ejs.renderFile);
const learnerModel = require("../models/learner");
const instructorModel = require("../models/instructor");
const adminModel = require("../models/admin");
const authModel = require("../models/auth");
const transporter = require("../configs/mail");
const sendResponse = require("../utils/commonResponse");
const HTTP_STATUS = require("../constants/statusCodes");

class AuthController {
	async signup(req, res) {
		try {
			const allowedProperties = [
				"email",
				"password",
				"confirmPassword",
				"name",
				"role",
			];
			const unexpectedProps = Object.keys(req.body).filter(
				(key) => !allowedProperties.includes(key)
			);
			if (unexpectedProps.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to sign up",
					`Unexpected properties: ${unexpectedProps.join(", ")}`
				);
			}

			const validation = validationResult(req).array();
			if (validation.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to sign up",
					validation
				);
			}

			const { email, password, name, role } = req.body;

			const isEmailRegistered = await authModel.findOne({ email: email });
			if (isEmailRegistered) {
				return sendResponse(
					res,
					HTTP_STATUS.CONFLICT,
					"Email is already registered",
					"Conflict"
				);
			}

			const rolesToModel = {
				learner: learnerModel,
				instructor: instructorModel,
				admin: adminModel,
			};

			const userModel = rolesToModel[role];
			const user = await userModel.create({
				name: name,
				email: email,
			});

			const filteredInfo = user.toObject();
			delete filteredInfo.createdAt;
			delete filteredInfo.updatedAt;
			delete filteredInfo.__v;

			const hashedPassword = await bcrypt
				.hash(password, 10)
				.then((hash) => {
					return hash;
				});

			const rolesToReference = {
				learner: learnerReference,
				instructor: instructorReference,
				amdin: adminReference,
			};
			const userReference = rolesToReference[role];

			await authModel
				.create({
					email: email,
					password: hashedPassword,
					userReference: user._id,
					role: role,
				})
				.then(() => {
					return sendResponse(
						res,
						HTTP_STATUS.OK,
						"Successfully signed up",
						filteredInfo
					);
				});
		} catch (error) {
			return sendResponse(
				res,
				HTTP_STATUS.INTERNAL_SERVER_ERROR,
				"Internal server error",
				"Server error"
			);
		}
	}

	async signin(req, res) {
		try {
			const allowedProperties = ["email", "password"];
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
					"Failed to sign in",
					validation
				);
			}

			const { email, password } = req.body;

			const auth = await authModel
				.findOne({ email: email })
				.populate("user", "-createdAt -updatedAt -__v")
				.select("-email -forgotEmailSent -createdAt -updatedAt -__v");

			if (!auth) {
				return sendResponse(
					res,
					HTTP_STATUS.UNAUTHORIZED,
					"Email is not registered",
					"Unauthorized"
				);
			}

			const checkPassword = await bcrypt.compare(password, auth.password);

			if (!checkPassword) {
				auth.signInFailed += 1;

				if (auth.signInFailed < 5) {
					await auth.save();
					return sendResponse(
						res,
						HTTP_STATUS.UNAUTHORIZED,
						"Invalid credentials",
						"Unauthorized"
					);
				}

				const blockedDuration = 60 * 60 * 1000;
				auth.signInBlockedUntil = new Date(
					Date.now() + blockedDuration
				);
				await auth.save();
				return sendResponse(
					res,
					HTTP_STATUS.FORBIDDEN,
					"You have exceeded the maximum number of requests per hour",
					"Forbidden"
				);
			}

			if (
				auth.signInBlockedUntil &&
				auth.signInBlockedUntil > new Date(Date.now())
			) {
				return sendResponse(
					res,
					HTTP_STATUS.FORBIDDEN,
					"You have exceeded the maximum number of requests per hour",
					"Forbidden"
				);
			}

			if (auth.signInFailed > 0) {
				auth.signInFailed = 0;
				auth.signInBlockedUntil = null;
				await auth.save();
			}

			const responseAuth = auth.toObject();
			delete responseAuth.updatedAt;
			delete responseAuth.password;
			delete responseAuth.signInFailed;
			delete responseAuth.signInBlockedUntil;

			const jwt = jsonwebtoken.sign(
				responseAuth,
				process.env.SECRET_KEY,
				{
					expiresIn: "1h",
				}
			);

			responseAuth.token = jwt;

			return sendResponse(
				res,
				HTTP_STATUS.OK,
				"Successfully signed in",
				responseAuth
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

	async sendForgotPasswordEmail(req, res) {
		try {
			const allowedProperties = ["email"];
			const unexpectedProps = Object.keys(req.body).filter(
				(key) => !allowedProperties.includes(key)
			);
			if (unexpectedProps.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to reset password",
					`Unexpected properties: ${unexpectedProps.join(", ")}`
				);
			}

			const validation = validationResult(req).array();
			if (validation.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to reset password",
					validation
				);
			}

			const { email } = req.body;

			const auth = await authModel
				.findOne({ email: email })
				.populate("user", "-createdAt -updatedAt -__v")
				.select("-email -createdAt -updatedAt -__v");

			if (!auth) {
				return sendResponse(
					res,
					HTTP_STATUS.UNAUTHORIZED,
					"Email is not registered",
					"Unauthorized"
				);
			}

			if (auth.forgotEmailSent >= 5) {
				return sendResponse(
					res,
					HTTP_STATUS.FORBIDDEN,
					"Something went wrong. Please try again later"
				);
			}

			const resetToken = crypto.randomBytes(32).toString("hex");
			const resetURL = path.join(
				process.env.FRONTEND_URL,
				"reset-password",
				resetToken,
				auth._id.toString()
			);

			const htmlBody = await ejsRenderFile(
				path.join(__dirname, "..", "views", "forgotPasswordEmail.ejs"),
				{
					name: auth.user.name,
					resetURL: resetURL,
				}
			);

			const result = await transporter.sendMail({
				from: "skillbase@system.com",
				to: `${auth.user.name} ${email}`,
				subject: "Forgot password?",
				html: htmlBody,
			});

			if (result.messageId) {
				auth.forgotEmailSent += 1;
				auth.resetPasswordToken = resetToken;
				auth.resetPasswordValidUntil = Date.now() + 60 * 60 * 1000;
				await auth.save();
				return sendResponse(
					res,
					HTTP_STATUS.OK,
					"Reset password email sent"
				);
			}

			return sendResponse(
				res,
				HTTP_STATUS.UNPROCESSABLE_ENTITY,
				"Something went wrong. Please try again later"
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

	async resetPassword(req, res) {
		try {
			const { token, id, newPassword, confirmPassword } = req.body;

			const auth = await authModel.findById({
				_id: id,
			});

			if (!auth) {
				return sendResponse(
					res,
					HTTP_STATUS.NOT_FOUND,
					"Invalid request"
				);
			}

			if (auth.resetPasswordValidUntil < Date.now()) {
				return sendResponse(res, HTTP_STATUS.GONE, "Expired request");
			}

			if (
				auth.resetPasswordToken !== token ||
				auth.forgotEmailSent === 0
			) {
				return sendResponse(
					res,
					HTTP_STATUS.UNAUTHORIZED,
					"Invalid request"
				);
			}

			if (newPassword !== confirmPassword) {
				return sendResponse(
					res,
					HTTP_STATUS.NOT_FOUND,
					"Passwords do not match"
				);
			}

			if (await bcrypt.compare(newPassword, auth.password)) {
				return sendResponse(
					res,
					HTTP_STATUS.NOT_FOUND,
					"Password cannot be same as the old password"
				);
			}

			const hashedPassword = await bcrypt
				.hash(newPassword, 10)
				.then((hash) => {
					return hash;
				});

			const result = await authModel.findByIdAndUpdate(
				{ _id: id },
				{
					password: hashedPassword,
					forgotEmailSent: 0,
					resetPasswordValidUntil: null,
					resetPasswordToken: null,
				},
				{ new: true }
			);

			if (result.isModified) {
				return sendResponse(
					res,
					HTTP_STATUS.OK,
					"Successfully updated password"
				);
			}
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

module.exports = new AuthController();
