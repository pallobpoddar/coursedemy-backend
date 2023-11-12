const multer = require("multer");
const dotenv = require("dotenv");
const AWS = require("aws-sdk");

dotenv.config();

AWS.config.update({
	region: "eu-west-3",
	credentials: {
		accessKeyId: process.env.ACCESS_KEY,
		secretAccessKey: process.env.SECRET_ACCESS_KEY,
	},
});

const s3 = new AWS.S3();

const upload = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 1024 * 1024 * 1024,
	},
});

const uploadToS3 = (params) => {
	return new Promise((resolve, reject) => {
		s3.upload(params, (err, data) => {
			if (err) {
				reject(err);
			} else {
				resolve(data.Location);
			}
		});
	});
};

module.exports = { upload, uploadToS3 };
