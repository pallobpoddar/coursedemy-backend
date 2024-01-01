const { validationResult } = require("express-validator");
const path = require("path");
const ejs = require("ejs");
const { promisify } = require("util");
const ejsRenderFile = promisify(ejs.renderFile);
const transporter = require("../configs/mail");
const authModel = require("../models/auth");
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

			section.lectures.push(lecture._id);
			await section.save();

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

	async getAll(req, res) {
		try {
			const courses = await courseModel
				.find({ isApproved: true })
				.populate("instructorReference")
				.populate("categoryReference")
				.select("-isApproved -createdAt -updatedAt -__v");
			if (!courses) {
				return sendResponse(
					res,
					HTTP_STATUS.NOT_FOUND,
					"No courses found",
					"Not found"
				);
			}

			return sendResponse(
				res,
				HTTP_STATUS.OK,
				"Successfully received the courses",
				courses
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
				.select("-createdAt -updatedAt -__v");
			if (!course) {
				return sendResponse(
					res,
					HTTP_STATUS.UNAUTHORIZED,
					"Course is not registered",
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

	async updateOneByCourseReference(req, res) {
		try {
			const allowedProperties = [
				"courseReference",
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

			const { courseReference, title, categoryReference } = req.body;

			if (!title && !categoryReference) {
				return sendResponse(
					res,
					HTTP_STATUS.BAD_REQUEST,
					"Invalid request",
					"Bad request"
				);
			}

			const course = await courseModel
				.findById({
					_id: courseReference,
				})
				.select("-createdAt -updatedAt -__v");
			if (!course) {
				return sendResponse(
					res,
					HTTP_STATUS.UNAUTHORIZED,
					"Course is not registered",
					"Unauthorized"
				);
			}

			const updatedCourse = await courseModel
				.findByIdAndUpdate(
					{ _id: courseReference },
					{
						title: title,
						categoryReference: categoryReference,
					},
					{ new: true }
				)
				.select("-createdAt -updatedAt -__v");

			return sendResponse(
				res,
				HTTP_STATUS.OK,
				"Successfully updated the course",
				updatedCourse
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

	async uploadThumbnail(req, res) {
		try {
			const allowedProperties = ["courseReference"];
			const unexpectedProps = Object.keys(req.body).filter(
				(key) => !allowedProperties.includes(key)
			);
			if (unexpectedProps.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to upload the thumbnail",
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

			const { courseReference } = req.body;

			const course = await courseModel
				.findById({
					_id: courseReference,
				})
				.select("-createdAt -__v");
			if (!course) {
				return sendResponse(
					res,
					HTTP_STATUS.UNAUTHORIZED,
					"Course is not registered",
					"Unauthorized"
				);
			}

			const params = {
				Bucket: `pallob-inception-bucket/final-project/${req.awsFolder}`,
				Key: req.file.originalname,
				Body: req.file.buffer,
			};
			const thumbnail = await uploadToS3(params);

			course.thumbnail = thumbnail;
			await course.save();

			const filteredInfo = course.toObject();
			delete filteredInfo.updatedAt;

			return sendResponse(
				res,
				HTTP_STATUS.OK,
				"Successfully uploaded the thumbnail",
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

	async uploadPromoVideo(req, res) {
		try {
			const allowedProperties = ["courseReference"];
			const unexpectedProps = Object.keys(req.body).filter(
				(key) => !allowedProperties.includes(key)
			);
			if (unexpectedProps.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to upload the promo video",
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

			const { courseReference } = req.body;

			const course = await courseModel
				.findById({
					_id: courseReference,
				})
				.select("-createdAt -__v");
			if (!course) {
				return sendResponse(
					res,
					HTTP_STATUS.UNAUTHORIZED,
					"Course is not registered",
					"Unauthorized"
				);
			}

			const params = {
				Bucket: `pallob-inception-bucket/final-project/${req.awsFolder}`,
				Key: req.file.originalname,
				Body: req.file.buffer,
			};
			const promoVideo = await uploadToS3(params);

			course.promoVideo = promoVideo;
			await course.save();

			const filteredInfo = course.toObject();
			delete filteredInfo.updatedAt;

			return sendResponse(
				res,
				HTTP_STATUS.OK,
				"Successfully uploaded the promo video",
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

	async sendPublishRequest(req, res) {
		try {
			const allowedProperties = ["courseReference"];
			const unexpectedProps = Object.keys(req.body).filter(
				(key) => !allowedProperties.includes(key)
			);
			if (unexpectedProps.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to send publishrequest",
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

			const { courseReference } = req.body;

			const course = await courseModel
				.findById({ _id: courseReference })
				.populate("instructorReference", "email")
				.select("-createdAt -updatedAt -__v");

			if (!course) {
				return sendResponse(
					res,
					HTTP_STATUS.UNAUTHORIZED,
					"Course is not registered",
					"Unauthorized"
				);
			}

			const courseURL = path.join(
				process.env.FRONTEND_URL,
				`instructor/course/${courseReference}/curriculum`
			);

			const actionsURL = path.join(
				process.env.FRONTEND_URL,
				`admin/course-publication-request/${courseReference}`
			);

			const admin = await authModel
				.findOne({ role: "admin" })
				.populate("adminReference", "name");
			const name = admin.adminReference.name;

			const htmlBody = await ejsRenderFile(
				path.join(__dirname, "..", "views", "coursePublishRequest.ejs"),
				{
					name: name,
					courseURL: courseURL,
					actionsURL: actionsURL,
				}
			);

			const updatedCourse = await transporter.sendMail({
				from: course.instructorReference.email,
				to: admin.email,
				subject: "Coursedemy - Publication Request",
				html: htmlBody,
			});

			if (updatedCourse.messageId) {
				return sendResponse(
					res,
					HTTP_STATUS.OK,
					"A publication email has been sent to the admin"
				);
			}

			return sendResponse(
				res,
				HTTP_STATUS.UNPROCESSABLE_ENTITY,
				"Something went wrong. Please try again later"
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

	async publishCourse(req, res) {
		try {
			const allowedProperties = ["courseReference"];
			const unexpectedProps = Object.keys(req.body).filter(
				(key) => !allowedProperties.includes(key)
			);
			if (unexpectedProps.length > 0) {
				return sendResponse(
					res,
					HTTP_STATUS.UNPROCESSABLE_ENTITY,
					"Failed to send publishrequest",
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

			const { courseReference } = req.body;

			const course = await courseModel
				.findById({ _id: courseReference })
				.select("-createdAt -__v");

			if (!course) {
				return sendResponse(
					res,
					HTTP_STATUS.UNAUTHORIZED,
					"Course is not registered",
					"Unauthorized"
				);
			}

			course.isApproved = true;
			await course.save();

			return sendResponse(
				res,
				HTTP_STATUS.OK,
				"The course has been published successfully"
			);
		} catch (error) {
			console.log(error);
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
