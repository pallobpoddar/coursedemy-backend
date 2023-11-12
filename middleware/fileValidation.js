const path = require("path");
const fileTypes = require("../constants/fileTypes");
const HTTP_STATUS = require("../constants/statusCodes");
const sendResponse = require("../util/commonResponse");
const fs = require("fs");

class fileController {
	async uploadFile(req, res, next) {
		try {
			if (!req.file) {
				return sendResponse(
					res,
					HTTP_STATUS.NOT_FOUND,
					"Failed to upload file"
				);
			}

			const extension = req.file.originalname.split(".").pop();
			if (!fileTypes.includes(extension)) {
				return sendResponse(
					res,
					HTTP_STATUS.NOT_FOUND,
					"Only .jpg, .png, .jpeg, .txt, .pdf, .doc, .ppt, .mkv, .mp4 extensions are allowed"
				);
			}

			if (
				extension === ".jpg" ||
				extension === ".jpeg" ||
				extension === ".png"
			) {
				req.awsFolder = "images";
			} else if (
				extension === ".pdf" ||
				extension === ".doc" ||
				extension === ".ppt"
			) {
				req.awsFolder = "readings";
			} else if (extension === ".mkv" || extension === ".mp4") {
				req.awsFolder = "videos";
			}

			next();
		} catch (error) {
			return sendResponse(
				res,
				HTTP_STATUS.INTERNAL_SERVER_ERROR,
				"Internal server error"
			);
		}
	}

	async getFile(req, res, next) {
		try {
			const { filepath } = req.params;

			const lastDotIndex = filepath.lastIndexOf(".");
			let fileExtension;

			if (lastDotIndex !== -1) {
				fileExtension = filepath.slice(lastDotIndex);
			}

			if (!fileTypes.includes(fileExtension)) {
				return sendResponse(
					res,
					HTTP_STATUS.NOT_FOUND,
					"Only .jpg, .png, .jpeg, .txt, .pdf extensions are allowed"
				);
			}

			let directory;
			if (
				fileExtension === ".jpg" ||
				fileExtension === ".jpeg" ||
				fileExtension === ".png"
			) {
				directory = "images";
			} else if (fileExtension === ".pdf") {
				directory = "pdf";
			} else if (fileExtension === ".txt") {
				directory = "text";
			}

			const exists = fs.existsSync(
				path.join(__dirname, "..", "server", directory, filepath)
			);

			if (!exists) {
				return sendResponse(
					res,
					HTTP_STATUS.NOT_FOUND,
					"File not found"
				);
			}
			return res
				.status(200)
				.sendFile(
					path.join(__dirname, "..", "server", directory, filepath)
				);
		} catch (error) {
			console.log(error);
			return sendResponse(
				res,
				HTTP_STATUS.INTERNAL_SERVER_ERROR,
				"Internal server error"
			);
		}
	}
}

module.exports = new fileController();
