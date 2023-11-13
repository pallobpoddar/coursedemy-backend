const { validationResult } = require("express-validator");
const sendResponse = require("../utils/commonResponse");
const HTTP_STATUS = require("../constants/statusCodes");
const cartModel = require("../models/cart");
const learnerModel = require("../models/learner");
const courseModel = require("../models/course");

class CartController {
	async addCourse(req, res) {
		try {
			const allowedProperties = ["learnerReference", "courseReference"];
			const unexpectedProps = Object.keys(req.body).filter(
				(key) => !allowedProperties.includes(key)
			);
			if (unexpectedProps.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to add course to the cart",
					`Unexpected properties: ${unexpectedProps.join(", ")}`
				);
			}

			const validation = validationResult(req).array();
			if (validation.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to add course to the cart",
					validation
				);
			}

			const { learnerReference, courseReference } = req.body;

			const learner = await learnerModel.findById({ _id: learnerReference });
			if (!learner) {
				return sendResponse(
					res,
					HTTP_STATUS.UNAUTHORIZED,
					"Learner is not registered",
					"Unauthorized"
				);
			}

			const course = await courseModel.findById({ _id: courseReference });
			if (!course) {
				return sendResponse(
					res,
					HTTP_STATUS.NOT_FOUND,
					"Course is not registered",
					"Not found"
				);
			}

			let cart;
			let cartObject = await cartModel.findOne({
				learnerReference: learnerReference,
			});
			if (!cartObject) {
				cart = await cartModel.create({
					learnerReference: learnerReference,
					courses: courseReference,
				});
			} else {
				cartObject.courses.push(courseReference);
				cart = await cartObject.save();
			}

			const cartFilteredInfo = cart.toObject();
			delete cartFilteredInfo.createdAt;
			delete cartFilteredInfo.updatedAt;
			delete cartFilteredInfo.__v;

			return sendResponse(
				res,
				HTTP_STATUS.OK,
				"Successfully added course to the cart",
				cartFilteredInfo
			);
		} catch (error) {
			return sendResponse(
				res,
				HTTP_STATUS.INTERNAL_SERVER_ERROR,
				"Internal server error",
				"Server error"
			);
		}
	}

	/**
	 * Retrieve function to get the cart's data
	 * @param {*} req
	 * @param {*} res
	 * @returns Response to the client
	 */
	async getCart(req, res) {
		try {
			// If the learner provides invalid information, it returns an error
			const validation = validationResult(req).array();
			if (validation.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to get the cart",
					validation
				);
			}

			// Destructures learner id from request params
			const { id } = req.params;

			// If the learner is not registered, it returns an error
			const learner = await userModel.findById({ _id: id });
			if (!learner) {
				return sendResponse(
					res,
					HTTP_STATUS.NOT_FOUND,
					"User does not exist",
					"Not found"
				);
			}

			// Retrieves cart data and unselects unnecessary fields
			const cart = await cartModel
				.findOne({ learner: id })
				.populate("books.course", "-createdAt -updatedAt -__v")
				.select("-createdAt -updatedAt -__v");

			// If the cart is not registered, it returns an error
			if (!cart) {
				return sendResponse(
					res,
					HTTP_STATUS.NOT_FOUND,
					"Cart does not exist for learner",
					"Not found"
				);
			}

			// Otherwise returns the cart data
			return sendResponse(
				res,
				HTTP_STATUS.OK,
				"Successfully got cart for learner",
				cart
			);
		} catch (error) {
			// Returns an error
			return sendResponse(
				res,
				HTTP_STATUS.INTERNAL_SERVER_ERROR,
				"Internal server error",
				"Server error"
			);
		}
	}

	/**
	 * Delete function to remove items from a cart
	 * @param {*} req
	 * @param {*} res
	 * @returns Response to the client
	 */
	async removeItems(req, res) {
		try {
			// If the learner provides invalid information, it returns an error
			const validation = validationResult(req).array();
			if (validation.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to remove items",
					validation
				);
			}

			// Destructures necessary elements from request body
			const { userId, bookId, quantity } = req.body;

			// If the learner is not registered, it returns an error
			const learner = await userModel.findById({ _id: userId });
			if (!learner) {
				return sendResponse(
					res,
					HTTP_STATUS.UNAUTHORIZED,
					"You are not registered",
					"Unauthorized"
				);
			}

			// If the course is not registered, it returns an error
			const course = await bookModel.findById({ _id: bookId });
			if (!course) {
				return sendResponse(
					res,
					HTTP_STATUS.NOT_FOUND,
					"Book is not registered",
					"Not found"
				);
			}

			// Checks if the course has any discount
			const discount = await discountModel.findOne({ course: bookId });

			// Converts the mongoDB document to a javascript object
			const bookObject = course.toObject();

			// If no cart is found, it returns an error
			let cartObject = await cartModel.findOne({ learner: userId });
			if (!cartObject) {
				return sendResponse(
					res,
					HTTP_STATUS.NOT_FOUND,
					"You don't have a cart",
					"Not found"
				);
			}

			// Otherwise checks if quantity becomes greater than 0 or not
			let removeFlag = false;
			let responseFlag = false;
			cartObject.books.forEach((data) => {
				const bookIdToString = String(data.course);
				if (bookIdToString === bookId) {
					removeFlag = true;
					if (data.quantity - quantity >= 0) {
						data.quantity = data.quantity - quantity;
					} else {
						responseFlag = true;
					}
				}
			});

			// If quantity becomes 0, it returns an error
			if (responseFlag === true) {
				return res
					.status(HTTP_STATUS.OK)
					.send(failure("Number of items should be at least 0"));
			}

			// If learner doesn't have this course in the cart, it returns an error
			if (removeFlag === false) {
				return res
					.status(HTTP_STATUS.OK)
					.send(failure("You don't have this course in your cart"));
			}

			// Calculates the total price and updates the cart document
			cartObject.total = discount
				? cartObject.total -
				  (bookObject.price * quantity -
						(bookObject.price * quantity * discount.percentage) / 100)
				: cartObject.total - bookObject.price * quantity;
			await cartObject.save();

			// Converts the mongoDB document to a javascript object	and deletes unnecessary fields
			const cartFilteredInfo = cartObject.toObject();
			delete cartFilteredInfo._id;
			delete cartFilteredInfo.createdAt;
			delete cartFilteredInfo.updatedAt;
			delete cartFilteredInfo.__v;

			// Returns cart data
			return sendResponse(
				res,
				HTTP_STATUS.OK,
				"Successfully removed items from the cart",
				cartFilteredInfo
			);
		} catch (error) {
			// Returns an error
			return sendResponse(
				res,
				HTTP_STATUS.INTERNAL_SERVER_ERROR,
				"Internal server error",
				"Server error"
			);
		}
	}
}

// Exports the cart controller
module.exports = new CartController();
