const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
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
		passMarks: {
			type: Number,
			required: [true, "Pass marks is required"],
		},
	},
	{ timestamps: true }
);

const quiz = mongoose.model("Quiz", quizSchema);
module.exports = quiz;
