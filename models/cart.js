const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
	{
		learnerReference: {
			type: mongoose.Types.ObjectId,
			ref: "Learner",
			required: true,
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

const cart = mongoose.model("Cart", cartSchema);
module.exports = cart;
