const mongoose = require("mongoose");

const authSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		user: {
			type: mongoose.Types.ObjectId,
			ref: "User",
			required: true,
		},
		role: {
			type: String,
			required: true,
		},
		signInFailed: {
			type: Number,
			required: false,
			default: 0,
		},
		signInBlockedUntil: {
			type: Date,
			required: false,
		},
		forgotEmailSent: {
			type: Number,
			required: false,
			default: 0,
		},
		forgotEmailBlockedUntil: {
			type: Date,
			required: false,
		},
		resetPasswordToken: {
			type: String || null,
			required: false,
		},
		resetPasswordValidUntil: {
			type: Date || null,
			required: false,
		},
	},
	{ timestamps: true }
);

const auth = mongoose.model("Auth", authSchema);
module.exports = auth;
