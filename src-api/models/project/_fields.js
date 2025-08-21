const roles = require('../../libraries/Session/roles');

const fields = {
	__DEFAULT__: [
		'id',
		'name',
		'billing_plan',
		'billing_period',
		'access_token',
		'stripe_subscription_id',
		'crashes_limit',
		'current_period_crashes_usage',
		'created_at',
		'updated_at'
	]
};

// Fields for customer
fields[roles.CUSTOMER] = fields.__DEFAULT__
// Fields to exclude
	.filter(field => [
	].indexOf(field) === -1);
// Fields to include
fields[roles.CUSTOMER].push(...[
	'subscription_status',
	'subscription_trial_end',
	'subscription_current_period_end',
	'subscription_cancel_at'
]);

// Fields for unauthenticated request
fields[roles.WITHOUT_CREDENTIALS] = fields[roles.CUSTOMER].slice();

/**
 * Here are the default fields for the model by role
 **/
module.exports = fields;
