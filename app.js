const express = require("express");
const app = express();
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const multer = require("multer");
const HTTP_STATUS = require("./constants/statusCodes");
const sendResponse = require("./utils/commonResponse");
const authRouter = require("./routes/authRoutes");
const learnerRouter = require("./routes/learnerRoutes");
const instructorRouter = require("./routes/instructorRoutes");
const courseRouter = require("./routes/courseRoutes");
const sectionRouter = require("./routes/sectionRoutes");
const lectureRouter = require("./routes/lectureRoutes");
const categoryRouter = require("./routes/categoryRoutes");
const subcategoryRouter = require("./routes/subcategoryRoutes");
const assignmentRouter = require("./routes/assignmentRoutes");
const quizRouter = require("./routes/quizRoutes");
const quizQuestionRouter = require("./routes/quizQuestionRoutes");
const cartRouter = require("./routes/cartRouter");
const subscriptionRouter = require("./routes/subscriptionRoutes");
const databaseConnection = require("./configs/database");

const accessLogStream = fs.createWriteStream(
	path.join(__dirname, "logFile.log"),
	{ flags: "a" }
);

dotenv.config();

app.use(cors());

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.use((err, req, res, next) => {
	if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
		return sendResponse(
			res,
			HTTP_STATUS.BAD_REQUEST,
			"Invalid JSON error",
			"Bad request"
		);
	}
	next();
});

app.use(morgan("combined", { stream: accessLogStream }));

app.use("/api/auths", authRouter);
app.use("/api/learners", learnerRouter);
app.use("/api/instructors", instructorRouter);
app.use("/api/courses", courseRouter);
app.use("/api/sections", sectionRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/subcategories", subcategoryRouter);
app.use("/api/lectures", lectureRouter);
app.use("/api/assignments", assignmentRouter);
app.use("/api/quizzes", quizRouter);
app.use("/api/quizQuestions", quizQuestionRouter);
app.use("/api/carts", cartRouter);
app.use("/api/subscriptions", subscriptionRouter);
app.use(async (req, res) => {
	return sendResponse(
		res,
		HTTP_STATUS.NOT_FOUND,
		"Page not found",
		"Not found"
	);
});

app.use((err, req, res, next) => {
	if (err instanceof multer.MulterError) {
		return sendResponse(res, 404, err.message);
	} else {
		next(err);
	}
});

databaseConnection(() => {
	app.listen(8000, () => {
		console.log("Server is running on 8000");
	});
});
