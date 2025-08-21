const uuid = require('uuid');

module.exports = async function (imageBase64) {
	// Pase base to buffer
	const bufferImage = Buffer.from(imageBase64, 'base64');
    
	const allowedExtensions = [
		['.png', Buffer.from('89504e47', 'hex')]
	];

	const ext = allowedExtensions.find(([_, buff]) => buff.compare(bufferImage.slice(0, buff.length)) === 0);

	if (!ext) {
		throw new Error('File format not alowed');
	}

	return this.AmazonS3Client.upload({
		Bucket: 'buglesstack-crashes-images',
		Key: `${uuid.v4()}${ext[0]}`,
		Body: bufferImage
	}).promise();
};
