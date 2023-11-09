const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
	learnerReference: {
		type: mongoose.Types.ObjectId,
		ref: "Learner",
		required: [true, "Learner reference is required"],
	},
	courseReference: {
		type: mongoose.Types.ObjectId,
		ref: "Course",
		required: [true, "Course reference is required"],
	},
	isApproved: {
		type: Boolean,
		required: [true, "IsApproved is required"],
		default: false,
	},
});

const subscription = mongoose.model("Subscription", subscriptionSchema);
module.exports = subscription;
