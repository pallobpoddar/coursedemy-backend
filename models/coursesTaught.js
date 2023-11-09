const mongoose = require("mongoose");

const coursesTaughtSchema = new mongoose.Schema({
	courseReference: {
		type: mongoose.Types.ObjectId,
		ref: "Course",
		required: [true, "Course reference is required"],
		unique: [true, "Course reference already exists"],
	},
	instructorReference: {
		type: mongoose.Types.ObjectId,
		ref: "Instructor",
		required: [true, "Instructor reference is required"],
	},
});

const CoursesTaught = mongoose.model("CoursesTaught", coursesTaughtSchema);
module.exports = CoursesTaught;
