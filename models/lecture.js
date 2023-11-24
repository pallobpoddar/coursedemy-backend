const mongoose = require("mongoose");

const lectureSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: [true, "Title is required"],
			maxLength: [100, "Character limit exceeded"],
		},
		content: {
			type: String,
			maxLength: [200, "Character limit exceeded"],
		},
		isAccessibleToUnsubsribedLearners: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
);

const lesson = mongoose.model("Lecture", lectureSchema);
module.exports = lesson;
