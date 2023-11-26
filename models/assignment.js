const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
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
		question: {
			type: String,
			required: [true, "Question is required"],
			maxLength: [200, "Character limit exceeded"],
		},
	},
	{ timestamps: true }
);

const assignment = mongoose.model("Assignment", assignmentSchema);
module.exports = assignment;
