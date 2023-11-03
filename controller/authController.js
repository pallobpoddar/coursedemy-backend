const { validationResult } = require("express-validator");
const sendResponse = require("../util/commonResponse");
const HTTP_STATUS = require("../constants/statusCodes");
const userModel = require("../model/user");
const authModel = require("../model/auth");
const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");
const path = require("path");
const { promisify } = require("util");
const ejs = require("ejs");
const transporter = require("../config/mail");
const ejsRenderFile = promisify(ejs.renderFile);
const crypto = require("crypto");
const { default: mongoose } = require("mongoose");
const { signupHelper } = require("../util/commonFunctions");

class AuthController {
	async signup(req, res) {
		signupHelper(req, res);
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
				.select("-_id -email -createdAt -updatedAt -__v");

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
				auth.failedAttempts += 1;

				if (auth.failedAttempts < 5) {
					auth.save();
					return sendResponse(
						res,
						HTTP_STATUS.UNAUTHORIZED,
						"Invalid credentials",
						"Unauthorized"
					);
				}

				const blockedDuration = 60 * 60 * 1000;
				auth.blockedUntil = new Date(Date.now() + blockedDuration);
				auth.save();
				return sendResponse(
					res,
					HTTP_STATUS.FORBIDDEN,
					"Your signin access has been blocked for an hour",
					"Forbidden"
				);
			} else {
				if (auth.blockedUntil && auth.blockedUntil <= new Date(Date.now())) {
					auth.failedAttempts = 0;
					auth.blockedUntil = null;
					auth.save();
				} else if (
					auth.blockedUntil &&
					auth.blockedUntil > new Date(Date.now())
				) {
					return sendResponse(
						res,
						HTTP_STATUS.FORBIDDEN,
						`Please sign in again at ${auth.blockedUntil}`,
						"Forbidden"
					);
				}

				const responseAuth = auth.toObject();
				delete responseAuth.password;
				delete responseAuth.failedAttempts;
				delete responseAuth.blockedUntil;

				const jwt = jsonwebtoken.sign(responseAuth, process.env.SECRET_KEY, {
					expiresIn: "1h",
				});

				responseAuth.token = jwt;

				return sendResponse(
					res,
					HTTP_STATUS.OK,
					"Successfully signed in",
					responseAuth
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
					"User is not registered",
					"Unauthorized"
				);
			}

			const resetToken = crypto.randomBytes(32).toString("hex");

			auth.resetPasswordToken = resetToken;
			auth.resetPasswordExpire = Date.now() + 60 * 60 * 1000;
			auth.resetPassword = true;
			await auth.save();

			const resetURL = path.join(
				process.env.FRONTEND_URL,
				"reset-password",
				resetToken,
				auth._id.toString()
			);

			const htmlBody = await ejsRenderFile(
				path.join(__dirname, "..", "views", "forgotPassword.ejs"),
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
				return sendResponse(
					res,
					HTTP_STATUS.OK,
					"Successfully requested for resetting password"
				);
			}

			return sendResponse(
				res,
				HTTP_STATUS.UNPROCESSABLE_ENTITY,
				"Something went wrong"
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
				return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Invalid request");
			}

			if (auth.resetPasswordExpire < Date.now()) {
				return sendResponse(res, HTTP_STATUS.GONE, "Expired request");
			}

			if (auth.resetPasswordToken !== token || auth.resetPassword === false) {
				return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, "Invalid token");
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

			const hashedPassword = await bcrypt.hash(newPassword, 10).then((hash) => {
				return hash;
			});

			const result = await authModel.findOneAndUpdate(
				{ _id: new mongoose.Types.ObjectId(id) },
				{
					password: hashedPassword,
					resetPassword: false,
					resetPasswordExpire: null,
					resetPasswordToken: null,
				}
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

	async validatePasswordResetRequest(req, res) {
		try {
			const { token, id } = req.body;

			const auth = await authModel.findOne({
				_id: new mongoose.Types.ObjectId(id),
			});
			if (!auth) {
				return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Invalid request");
			}

			if (auth.resetPasswordExpire < Date.now()) {
				return sendResponse(res, HTTP_STATUS.GONE, "Expired request");
			}

			if (auth.resetPasswordToken !== token || auth.resetPassword === false) {
				return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, "Invalid token");
			}
			return sendResponse(res, HTTP_STATUS.OK, "Request is still valid");
		} catch (error) {
			return sendResponse(
				res,
				HTTP_STATUS.INTERNAL_SERVER_ERROR,
				"Something went wrong!"
			);
		}
	}
}

module.exports = new AuthController();
