const AWS = require('aws-sdk');

const { AWSS3Config } = require('../../config/credentials');

/**
 * Amazon S3 client
 **/
module.exports.AmazonS3Client = new AWS.S3(AWSS3Config);

/**
 * Upload base64 encoded image item image
 **/
module.exports.uploadBase64Image = require('./uploadBase64Image').bind(module.exports);

/**
 * Upload html content
 **/
module.exports.uploadHtmlContent = require('./uploadHtmlContent').bind(module.exports);
