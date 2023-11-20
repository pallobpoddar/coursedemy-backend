const mongoose = require("mongoose");

const instructorSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: true,
			maxLength: [320, "Invalid email"],
		},
		name: {
			type: String,
			required: [true, "Name is required"],
			maxLength: [255, "Character limit exceeded"],
		},
		image: {
			type: String,
		},
	},
	{ timestamps: true }
);

const instructor = mongoose.model("Instructor", instructorSchema);
module.exports = instructor;
