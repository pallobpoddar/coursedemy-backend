const mongoose = require("mongoose");

const lectureSchema = new mongoose.Schema(
	{
		sectionReference: {
			type: mongoose.Types.ObjectId,
			ref: "Section",
			required: [true, "Section reference is required"],
		},
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
			required: [true, "IsAccessibleToUnsubsribedLearners is required"],
			default: false,
		},
	},
	{ timestamps: true }
);

const lesson = mongoose.model("Lecture", lectureSchema);
module.exports = lesson;
