const BaseModel = require('../../libraries/ModelCore/BaseModel');
const { createMethod } = require('../../libraries/ModelCore/baseUtils');

module.exports = new BaseModel('user_projects', require('./map'), 'user_project', require('./_fields'));

/**
 * Get all by user
 *
 * @param {string} userId User id
 * @param {any} options Method call options
 *
 * @return {any}
 **/
module.exports.getAllByUser = createMethod(require('./getAllByUser'), module.exports);

/**
 * Get by user and project
 *
 * @param {string} userId User id
 * @param {string} projectId Project id
 * @param {any} options Method call options
 *
 * @return {any}
 **/
module.exports.getByUserAndProject = createMethod(require('./getByUserAndProject'), module.exports);
