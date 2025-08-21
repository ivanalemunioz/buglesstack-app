const stripe = require('stripe');

const { StripeConfig } = require('../../config/credentials');

/**
 * Stripe client
 **/
module.exports.StripeClient = stripe(StripeConfig.SecretKey, {
	apiVersion: '2023-10-16'
});

/**
 * Create customer
 **/
module.exports.createCustomer = require('./createCustomer').bind(module.exports);

/**
 * Get customer
 **/
module.exports.getCustomer = require('./getCustomer').bind(module.exports);

/**
 * Get or create customer
 **/
module.exports.getOrCreateCustomer = require('./getOrCreateCustomer').bind(module.exports);

/**
 * Create subscription
 **/
module.exports.createSubscription = require('./createSubscription').bind(module.exports);

/**
 * Create checkout session
 **/
module.exports.createCheckoutSession = require('./createCheckoutSession').bind(module.exports);

/**
 * Get event
 **/
module.exports.getEvent = require('./getEvent').bind(module.exports);

/**
 * Get customer payment methods
 **/
module.exports.getCustomerPaymentMethods = require('./getCustomerPaymentMethods').bind(module.exports);

/**
 * Create payment intent
 **/
module.exports.createPaymentIntent = require('./createPaymentIntent').bind(module.exports);

/**
 * Get customer by id
 **/
module.exports.getCustomerById = require('./getCustomerById').bind(module.exports);

/**
 * Get price by lookup key
 **/
module.exports.getPriceByLookupKey = require('./getPriceByLookupKey').bind(module.exports);

/**
 * Create a billing portal session
 **/
module.exports.createBillingPortalSession = require('./createBillingPortalSession').bind(module.exports);

/**
 * Update subscription
 **/
module.exports.updateSubscription = require('./updateSubscription').bind(module.exports);

/**
 * Get subscription
 **/
module.exports.getSubscription = require('./getSubscription').bind(module.exports);

/**
 * Resume subscription
 **/
module.exports.resumeSubscription = require('./resumeSubscription').bind(module.exports);
