const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Category is required"],
			unique: [true, "Category already exists"],
			maxLength: [30, "Character limit exceeded"],
		},
	},
	{ timestamps: true }
);

const category = mongoose.model("Category", categorySchema);
module.exports = category;
