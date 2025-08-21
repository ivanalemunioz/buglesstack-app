const BaseModel = require('../../libraries/ModelCore/BaseModel');
const { createMethod } = require('../../libraries/ModelCore/baseUtils');

module.exports = new BaseModel('verify_codes', require('./map'), 'verify_code', require('./_fields'));

/**
 * Get code by method and address
 *
 * @param {string} method Method where the code was sended
 * @param {string} address Address where the code was sended
 * @param {any} options Method call options
 *
 * @return {any}
 **/
module.exports.getByMethodAndAddress = createMethod(require('./getByMethodAndAddress'), module.exports);
