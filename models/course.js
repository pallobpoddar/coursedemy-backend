const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
	{
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
		isApproved: {
			type: Boolean,
			required: [true, "IsApproved is required"],
			default: false,
		},
		categoryReference: {
			type: mongoose.Types.ObjectId,
			required: [true, "Category is required"],
		},
		subcategoryReference: {
			type: mongoose.Types.ObjectId,
			required: [true, "Subcategory is required"],
		},
	},
	{ timestamps: true }
);

const course = mongoose.model("Course", courseSchema);
module.exports = course;
