const roles = require('../../libraries/Session/roles');

const fields = {
	__DEFAULT__: [
		'id',
		'html',
		'screenshot',
		'message',
		'url',
		'stack',
		'crashed_user_email',
		'created_at',
		'updated_at',
		'metadata',

		'REFERENCE.project',
		'project.id'
	]
};

fields[roles.CUSTOMER] = [...fields.__DEFAULT__];

/**
 * Here are the default fields for the model by role
 **/
module.exports = fields;
