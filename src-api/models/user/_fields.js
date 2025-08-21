const roles = require('../../libraries/Session/roles');

const fields = {
	__DEFAULT__: [
		'id',
		'created_at',
		'updated_at',
		'role',
		'status',
		'email',
		'subscription_status',
		'suscription_status_updated_at',
		'has_payment_method'
	]
};

// Fields for customer
fields[roles.CUSTOMER] = fields.__DEFAULT__
// Fields to exclude
	.filter(field => [
	].indexOf(field) === -1);
// Fields to include
fields[roles.CUSTOMER].push(...[
]);

// Fields for unauthenticated request
fields[roles.WITHOUT_CREDENTIALS] = fields[roles.CUSTOMER].slice();

/**
 * Here are the default fields for the model by role
 **/
module.exports = fields;
