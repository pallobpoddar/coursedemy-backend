const fileTypes = require("../constants/fileTypes");
const HTTP_STATUS = require("../constants/statusCodes");
const sendResponse = require("../utils/commonResponse");

class fileController {
	async uploadFile(req, res, next) {
		try {
			if (!req.file) {
				return sendResponse(res, HTTP_STATUS.NOT_FOUND, "File not found");
			}

			const extension = req.file.originalname.split(".").pop();
			if (!fileTypes.includes(extension)) {
				return sendResponse(
					res,
					HTTP_STATUS.NOT_FOUND,
					"Only jpg, png, jpeg, txt, pdf, doc, ppt, mkv, mp4 extensions are allowed"
				);
			}

			if (extension === "jpg" || extension === "jpeg" || extension === "png") {
				req.awsFolder = "images";
			} else if (
				extension === "pdf" ||
				extension === "doc" ||
				extension === "xlsx" ||
				extension === "ppt"
			) {
				req.awsFolder = "readings";
			} else if (extension === "mkv" || extension === "mp4") {
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
}

module.exports = new fileController();
