const fields = {
	__DEFAULT__: [
		'id',
		'access_token',
		'refresh_token',
		'role',

		// For users
		'REFERENCE.user',
		'user.id',
		'user.email',
		'user.status',
		'user.role',

		'created_at',
		'updated_at',
		'expires_at'
	]
};

/**
 * Here are the default fields for the model by role
 **/
module.exports = fields;
