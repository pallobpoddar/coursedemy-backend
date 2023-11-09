const mongoose = require("mongoose");

const authSchema = new mongoose.Schema(
	{
		learnerReference: {
			type: mongoose.Types.ObjectId,
			ref: "Learner",
			unique: [true, "Learner reference already exists"],
		},
		instructorReference: {
			type: mongoose.Types.ObjectId,
			ref: "Instructor",
			unique: [true, "Instructor reference already exists"],
		},
		adminReference: {
			type: mongoose.Types.ObjectId,
			ref: "Admin",
			unique: [true, "Admin reference already exists"],
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
			maxLength: [20, "Invalid password"],
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
