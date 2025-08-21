const roles = require('../../libraries/Session/roles');

const fields = {
	__DEFAULT__: [
		'id',
		'method',
		'address',
		'code',
		'updated_at'
	]
};

// Fields for customer
fields[roles.CUSTOMER] = fields.__DEFAULT__.slice();

/**
 * Here are the default fields for the model by role
 **/
module.exports = fields;
