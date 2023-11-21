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
		},
		thumbnail: {
			type: String,
			maxLength: [200, "Character limit exceeded"],
		},
		promoVideo: {
			type: String,
			maxLength: [200, "Character limit exceeded"],
		},
	},
	{ timestamps: true }
);

const course = mongoose.model("Course", courseSchema);
module.exports = course;
