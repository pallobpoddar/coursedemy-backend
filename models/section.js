const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema(
	{
		courseReference: {
			type: mongoose.Types.ObjectId,
			ref: "Course",
			required: [true, "Course reference is required"],
		},
		title: {
			type: String,
			required: [true, "Title is required"],
			maxLength: [100, "Character limit exceeded"],
		},
		lectures: {
			type: [
				{
					type: mongoose.Types.ObjectId,
					ref: "Lecture",
				},
			],
		},
	},
	{ timestamps: true }
);

const section = mongoose.model("Section", sectionSchema);
module.exports = section;
