const express = require("express");
const app = express();
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const multer = require("multer");
const HTTP_STATUS = require("./constants/statusCodes");
const sendResponse = require("./util/commonResponse");
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const databaseConnection = require("./config/database");

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
app.use("/api/users", userRouter);
app.use(async (req, res) => {
	return sendResponse(
		res,
		HTTP_STATUS.NOT_FOUND,
		"Page not found",
		"Not found"
	);
});

app.use((err, req, res, next) => {
	console.log(err);
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
