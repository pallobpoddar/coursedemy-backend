const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
	instructorReference: {
		type: mongoose.Types.ObjectId,
		ref: "Instructor",
		required: [true, "Instructor reference is required"],
	},
	title: {
		type: String,
		required: [true, "Title is required"],
		maxLength: [100, "Character limit exceeded"],
	},
	description: {
		type: String,
		required: [true, "Description is required"],
		maxLength: [2000, "Character limit exceeded"],
	},
	language: {
		type: String,
		required: [true, "Language is required"],
	},
	isApproved: {
		type: Boolean,
		required: [true, "IsApproved is required"],
		default: false,
	},
});

const course = mongoose.model("Course", courseSchema);
module.exports = course;
