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
		sections: [
			{
				type: mongoose.Types.ObjectId,
				ref: "Section",
			},
		],
		category: {
			type: mongoose.Types.ObjectId,
			required: [true, "Category is required"],
		},
	},
	{ timestamps: true }
);

const course = mongoose.model("Course", courseSchema);
module.exports = course;
