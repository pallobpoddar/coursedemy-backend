const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: [true, "Title is required"],
			maxLength: [100, "Character limit exceeded"],
		},
		isAccessibleToUnsubsribedLearners: {
			type: Boolean,
			required: [true, "IsAccessibleToUnsubsribedLearners is required"],
			default: false,
		},
		lessons: {
			type: [
				{
					lesson: {
						type: mongoose.Types.ObjectId,
						ref: "Lesson",
						required: [true, "Lesson is required"],
					},
					_id: false,
				},
			],
		},
	},
	{ timestamps: true }
);

const section = mongoose.model("Section", sectionSchema);
module.exports = section;
