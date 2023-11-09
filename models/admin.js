const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
	email: {
		type: String,
		required: [true, "Email is required"],
		unique: [true, "Email already exists"],
		maxLength: [64, "Invalid email"],
	},
	name: {
		type: String,
		required: [true, "Name is required"],
		maxLength: [30, "Character limit exceeded"],
	},
	image: {
		type: String,
	},
});

const admin = mongoose.model("Admin", adminSchema);
module.exports = admin;
