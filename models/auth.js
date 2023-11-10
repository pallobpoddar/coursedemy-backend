const mongoose = require("mongoose");

const authSchema = new mongoose.Schema(
	{
		learnerReference: {
			type: mongoose.Types.ObjectId || null,
			ref: "Learner",
		},
		instructorReference: {
			type: mongoose.Types.ObjectId || null,
			ref: "Instructor",
		},
		adminReference: {
			type: mongoose.Types.ObjectId || null,
			ref: "Admin",
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: [true, "Email already exists"],
			maxLength: [64, "Invalid email"],
		},
		password: {
			type: String,
			required: [true, "Password is required"],
		},
		role: {
			type: String,
			required: [true, "Role is required"],
		},
		isVerified: {
			type: Boolean,
			required: [true, "IsVerified is required"],
			default: false,
		},
		signInFailed: {
			type: Number,
			default: 0,
		},
		signInBlockedUntil: {
			type: Date,
		},
		forgotEmailSent: {
			type: Number,
			default: 0,
		},
		forgotEmailBlockedUntil: {
			type: Date,
		},
		resetPasswordToken: {
			type: String || null,
		},
		resetPasswordValidUntil: {
			type: Date || null,
		},
	},
	{ timestamps: true }
);

const auth = mongoose.model("Auth", authSchema);
module.exports = auth;
