const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
	{
		learnerReference: {
			type: mongoose.Types.ObjectId,
			ref: "Learner",
			required: [true, "Learner reference is required"],
		},
		courses: {
			type: [
				{
					type: mongoose.Types.ObjectId,
					ref: "Course",
				},
			],
		},
	},
	{ timestamps: true }
);

const wishlist = mongoose.model("Wishlist", wishlistSchema);
module.exports = wishlist;
