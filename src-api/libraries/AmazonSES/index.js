const AWS = require('aws-sdk');

const { AmazonSESConfig } = require('../../config/credentials');

/**
 * Amazon SES client
 **/
module.exports.AmazonSESClient = new AWS.SES(AmazonSESConfig);

/**
 * Send email
 **/
module.exports.sendEmail = require('./sendEmail').bind(module.exports);
