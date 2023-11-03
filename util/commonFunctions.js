const { validationResult } = require("express-validator");
const sendResponse = require("./commonResponse");
const HTTP_STATUS = require("../constants/statusCodes");
const userModel = require("../model/user");
const authModel = require("../model/auth");
const bcrypt = require("bcrypt");

const signupHelper = async (req, res) => {
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

		const isEmailRegistered = await userModel.findOne({ email: email });
		if (isEmailRegistered) {
			return sendResponse(
				res,
				HTTP_STATUS.CONFLICT,
				"Email is already registered",
				"Conflict"
			);
		}

		const user = await userModel.create({
			name: name,
			email: email,
		});

		const userFilteredInfo = deleteStatements(user);

		const hashedPassword = await bcrypt.hash(password, 10).then((hash) => {
			return hash;
		});

		await authModel
			.create({
				email: email,
				password: hashedPassword,
				user: user._id,
				role: role,
			})
			.then(() => {
				return sendResponse(
					res,
					HTTP_STATUS.OK,
					"Successfully signed up",
					userFilteredInfo
				);
			});
	} catch (error) {
		console.log(error);
		return sendResponse(
			res,
			HTTP_STATUS.INTERNAL_SERVER_ERROR,
			"Internal server error",
			"Server error"
		);
	}
};

const deleteStatements = (document) => {
	const filteredInfo = document.toObject();
	delete filteredInfo.createdAt;
	delete filteredInfo.updatedAt;
	delete filteredInfo.__v;
	return filteredInfo;
};

module.exports = { deleteStatements, signupHelper };
