const BaseModel = require('../../libraries/ModelCore/BaseModel');
const { createMethod } = require('../../libraries/ModelCore/baseUtils');

module.exports = new BaseModel('crashes', require('./map'), 'crash', require('./_fields'));

/**
 * Get by project id
 *
 * @param {string} projectId Project id
 * @param {number} limit Limit
 * @param {string} start Start id
 * @param {any} options Method call options
 *
 * @return {any}
 **/
module.exports.getByProject = createMethod(require('./getByProject'), module.exports);

/**
 * Get by share token
 *
 * @param {string} shareToken Share token
 * @param {any} options Method call options
 *
 * @return {any}
 **/
module.exports.getByShareToken = createMethod(require('./getByShareToken'), module.exports);
