const uuid = require('uuid');

module.exports = async function (htmlContent) {
	return this.AmazonS3Client.upload({
		Bucket: 'buglesstack-crashes-html',
		Key: `${uuid.v4()}.html`,
		Body: htmlContent
	}).promise();
};
