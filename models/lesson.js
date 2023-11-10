const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
	{
		content: {
			type: String,
			required: [true, "Content is required"],
		},
	},
	{ timestamps: true }
);

const lesson = mongoose.model("Lesson", lessonSchema);
module.exports = lesson;
