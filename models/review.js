const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
	{
		courseReference: {
			type: mongoose.Types.ObjectId,
			ref: "Course",
			required: [true, "Course reference is required"],
		},
		learnerReference: {
			type: mongoose.Types.ObjectId,
			ref: "Learner",
			required: [true, "Learner reference is required"],
		},
		rating: {
			type: Number,
			required: [true, "Rating is required"],
			max: 5,
		},
		review: {
			type: String,
			maxLength: 1000,
		},
	},
	{ timestamps: true }
);

const review = mongoose.model("Review", reviewSchema);
module.exports = review;
