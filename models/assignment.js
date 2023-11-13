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
		totalMarks: {
			type: Number,
			required: [true, "Total marks is required"],
		},
		passMarks: {
			type: Number,
			required: [true, "Pass marks is required"],
		},
	},
	{ timestamps: true }
);

const assignment = mongoose.model("Assignment", assignmentSchema);
module.exports = assignment;
