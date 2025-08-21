const roles = require('../../libraries/Session/roles');
const projectFields = require('../project/_fields');

const fields = {
	__DEFAULT__: [
		'id',
		'role',
		'created_at',

		// Foreign keys
		'REFERENCE.user',
		'user.id',

		// Foreign keys
		'REFERENCE.project',
		'project.id'
	]
};

// Fields for customer
fields[roles.CUSTOMER] = fields.__DEFAULT__
	// Fields to exclude
	.filter(field => [
		'REFERENCE.user',
		'user.id',

		'project.id'
	].indexOf(field) === -1);
// Fields to include
fields[roles.CUSTOMER].push(...[
	...([...projectFields[roles.CUSTOMER]]).map(field => `project.${field}`)
]);

/**
 * Here are the default fields for the model by role
 **/
module.exports = fields;
