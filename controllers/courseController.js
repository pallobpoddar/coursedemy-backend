const { validationResult } = require("express-validator");
const courseModel = require("../models/course");
const categoryModel = require("../models/category");
const instructorModel = require("../models/instructor");
const sectionModel = require("../models/section");
const lectureModel = require("../models/lecture");
const sendResponse = require("../utils/commonResponse");
const HTTP_STATUS = require("../constants/statusCodes");
const { uploadToS3 } = require("../configs/file");

class CourseController {
	async create(req, res) {
		try {
			const allowedProperties = [
				"instructorReference",
				"title",
				"categoryReference",
			];
			const unexpectedProps = Object.keys(req.body).filter(
				(key) => !allowedProperties.includes(key)
			);
			if (unexpectedProps.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to create the course",
					`Unexpected properties: ${unexpectedProps.join(", ")}`
				);
			}

			const validation = validationResult(req).array();
			if (validation.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					validation[0].msg,
					validation
				);
			}

			const { instructorReference, title, categoryReference } = req.body;

			const instructor = await instructorModel.findById({
				_id: instructorReference,
			});
			if (!instructor) {
				return sendResponse(
					res,
					HTTP_STATUS.UNAUTHORIZED,
					"Instructor is not registered",
					"Unauthorized"
				);
			}

			const category = await categoryModel.findById({
				_id: categoryReference,
			});
			if (!category) {
				return sendResponse(
					res,
					HTTP_STATUS.UNAUTHORIZED,
					"Category is not registered",
					"Unauthorized"
				);
			}

			const course = await courseModel.create({
				instructorReference: instructorReference,
				title: title,
				categoryReference: categoryReference,
			});

			const section = await sectionModel.create({
				courseReference: course._id,
				title: "Introduction",
			});

			const lecture = await lectureModel.create({
				sectionReference: section._id,
				title: "Introduction",
			});

			const filteredInfo = course.toObject();
			delete filteredInfo.createdAt;
			delete filteredInfo.updatedAt;
			delete filteredInfo.__v;

			return sendResponse(
				res,
				HTTP_STATUS.OK,
				"Successfully created the course",
				filteredInfo
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

	async getAllByInstructorReference(req, res) {
		try {
			const allowedProperties = ["instructorReference"];
			const unexpectedProps = Object.keys(req.params).filter(
				(key) => !allowedProperties.includes(key)
			);
			if (unexpectedProps.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to receive the courses",
					`Unexpected properties: ${unexpectedProps.join(", ")}`
				);
			}

			const validation = validationResult(req).array();
			if (validation.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					validation[0].msg,
					validation
				);
			}

			const { instructorReference } = req.params;

			const instructor = await instructorModel.findById({
				_id: instructorReference,
			});
			if (!instructor) {
				return sendResponse(
					res,
					HTTP_STATUS.UNAUTHORIZED,
					"Instructor is not registered",
					"Unauthorized"
				);
			}

			const courses = await courseModel
				.find({})
				.select("-createdAt -updatedAt -__v");
			if (courses.length === 0) {
				return sendResponse(res, HTTP_STATUS.OK, "No course has been found");
			}

			return sendResponse(
				res,
				HTTP_STATUS.OK,
				"Successfully received all courses",
				{
					result: courses,
					total: courses.length,
				}
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

	async getOneByCourseReference(req, res) {
		try {
			const allowedProperties = ["courseReference"];
			const unexpectedProps = Object.keys(req.body).filter(
				(key) => !allowedProperties.includes(key)
			);
			if (unexpectedProps.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to receive the course",
					`Unexpected properties: ${unexpectedProps.join(", ")}`
				);
			}

			const validation = validationResult(req).array();
			if (validation.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					validation[0].msg,
					validation
				);
			}

			const { courseReference } = req.params;

			const course = await courseModel
				.findById({
					_id: courseReference,
				})
				.select("-email -createdAt -updatedAt -__v");
			if (!course) {
				return sendResponse(
					res,
					HTTP_STATUS.UNAUTHORIZED,
					"Instructor is not registered",
					"Unauthorized"
				);
			}

			return sendResponse(
				res,
				HTTP_STATUS.OK,
				"Successfully received the course",
				course
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

	async updateOneById(req, res) {
		try {
			const allowedProperties = [
				"instructorReference",
				"title",
				"categoryReference",
			];
			const unexpectedProps = Object.keys(req.body).filter(
				(key) => !allowedProperties.includes(key)
			);
			if (unexpectedProps.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to create the course",
					`Unexpected properties: ${unexpectedProps.join(", ")}`
				);
			}

			const validation = validationResult(req).array();
			if (validation.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to create the course",
					validation
				);
			}

			const { id } = req.params;
			const {
				instructorReference,
				title,
				categoryReference,
				subcategoryReference,
			} = req.body;

			const thumbnailFile = req.files["thumbnail"][0];
			const promoVideoFile = req.files["promoVideo"][0];

			if (
				!instructorReference &&
				!title &&
				!categoryReference &&
				!subcategoryReference &&
				!thumbnailFile &&
				!promoVideoFile
			) {
				return sendResponse(
					res,
					HTTP_STATUS.BAD_REQUEST,
					"Invalid request",
					"Bad request"
				);
			}

			const thumbnailParams = {
				Bucket: `pallob-inception-bucket/final-project/images`,
				Key: thumbnailFile.originalname,
				Body: thumbnailFile.buffer,
			};
			const thumbnail = await uploadToS3(thumbnailParams);

			const promoVideoParams = {
				Bucket: `pallob-inception-bucket/final-project/videos`,
				Key: promoVideoFile.originalname,
				Body: promoVideoFile.buffer,
			};
			const promoVideo = await uploadToS3(promoVideoParams);

			const course = await courseModel
				.findByIdAndUpdate(
					{ _id: id },
					{
						instructorReference: instructorReference,
						title: title,
						categoryReference: categoryReference,
						subcategoryReference: subcategoryReference,
						thumbnail: thumbnail,
						promoVideo: promoVideo,
					},
					{ new: true }
				)
				.select("-createdAt -updatedAt -__v");

			if (!course) {
				return sendResponse(
					res,
					HTTP_STATUS.NOT_FOUND,
					"Course is not registered",
					"Not found"
				);
			}

			return sendResponse(
				res,
				HTTP_STATUS.OK,
				"Successfully updated the course",
				course
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
}

module.exports = new CourseController();
