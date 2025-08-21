const BaseModel = require('../../libraries/ModelCore/BaseModel');
const { createMethod } = require('../../libraries/ModelCore/baseUtils');

module.exports = new BaseModel('projects', require('./map'), 'project', require('./_fields'));

/**
 * Get project by access token
 *
 * @param accessToken Project access token
 * @param {any} options Method call options
 *
 * @return {any|null}
 **/
module.exports.getByAccessToken = createMethod(require('./getByAccessToken'), module.exports);

/**
 * Get project by stripe subscription id
 *
 * @param stripeSubscriptionId Stripe subscription id
 * @param {any} options Method call options
 *
 * @return {any|null}
 **/
module.exports.getByStripeSubscriptionId = createMethod(require('./getByStripeSubscriptionId'), module.exports);

/**
 * Get update stripe subscription data 
 *
 * @param id Stripe subscription id
 * @param stripeSubscription Stripe subscription
 *
 * @return {any|null}
 **/
module.exports.updateStripeSubscripcionData = createMethod(require('./updateStripeSubscripcionData'), module.exports);
