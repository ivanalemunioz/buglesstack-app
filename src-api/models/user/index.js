const BaseModel = require('../../libraries/ModelCore/BaseModel');
const { createMethod } = require('../../libraries/ModelCore/baseUtils');

module.exports = new BaseModel('users', require('./map'), 'user', require('./_fields'));

/**
 * Get all
 *
 * @param {number} limit Limit
 * @param {string} start Start id
 * @param {any} options Method call options
 *
 * @return {any}
 **/
module.exports.getAll = createMethod(require('./getAll'), module.exports);

/**
 * Get user by email
 *
 * @param {string} email Email
 * @param {any} options Method call options
 *
 * @return {array}
 **/
module.exports.getByEmail = createMethod(require('./getByEmail'), module.exports);

/**
 * Get users between created at
 *
 * @param {string} createdAtSince Created at since
 * @param {string} createdAtUntil Created at until
 * @param {number} limit Limit
 * @param {string} start Start id
 * @param {any} options Method call options
 *
 * @return {array}
 **/
module.exports.getByCreatedAt = createMethod(require('./getByCreatedAt'), module.exports);
