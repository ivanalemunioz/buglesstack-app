const BaseModel = require('../../libraries/ModelCore/BaseModel');
const { createMethod } = require('../../libraries/ModelCore/baseUtils');

module.exports = new BaseModel('session_tokens', require('./map'), 'session_token', require('./_fields'));

/**
 * Get by access token
 *
 * @param accessToken Access token
 * @param {any} options Method call options
 *
 * @return {any|null}
 **/
module.exports.getByAccessToken = createMethod(require('./getByAccessToken'), module.exports);

/**
 * Get by refresh token
 *
 * @param refreshToken Refresh token
 * @param {any} options Method call options
 *
 * @return {any|null}
 **/
module.exports.getByRefreshToken = createMethod(require('./getByRefreshToken'), module.exports);

/**
 * Create default
 *
 * @param {any} data Data for token
 *
 * @return {DocumentReference}
 **/
module.exports.createDefault = require('./createDefault').bind(module.exports);
