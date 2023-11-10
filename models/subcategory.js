const mongoose = require("mongoose");

const subcategorySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Category is required"],
			unique: [true, "Subcategory already exists"],
			maxLength: [50, "Character limit exceeded"],
		},
	},
	{ timestamps: true }
);

const subcategory = mongoose.model("Subcategory", subcategorySchema);
module.exports = subcategory;
