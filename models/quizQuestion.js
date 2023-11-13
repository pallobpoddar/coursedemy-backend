const mongoose = require("mongoose");

const quizQuestionSchema = new mongoose.Schema(
	{
		quizReference: {
			type: mongoose.Types.ObjectId,
			ref: "Quiz",
			required: [true, "Quiz reference is required"],
		},
		question: {
			type: String,
			required: [true, "Question is required"],
			maxLength: [1000, "Character limit exceeded"],
		},
		options: [
			{
				type: String,
				required: [true, "Options are required"],
			},
		],
		answer: {
			type: String,
			required: [true, "Answer is required"],
			maxLength: [100, "Character limit exceeded"],
		},
		marks: {
			type: Number,
			required: [true, "Marks is required"],
		},
	},
	{ timestamps: true }
);

const quizQuestion = mongoose.model("QuizQuestion", quizQuestionSchema);
module.exports = quizQuestion;
