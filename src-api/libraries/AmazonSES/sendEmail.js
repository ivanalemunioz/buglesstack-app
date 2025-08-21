module.exports = async function (params) {
	return this.AmazonSESClient.sendEmail(params).promise();
};
