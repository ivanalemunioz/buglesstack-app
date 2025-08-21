/**
 * Map an user
 *
 * @param data Document data
 **/
module.exports = async function mapOne (data, options) {
	// Set default permissions
	if (options.select.indexOf('permissions') !== -1 && (data.permissions === null || typeof data.permissions === 'undefined')) {
		data.permissions = {
			create_offers: false
		};
	}

	// Add default edit offers permission
	if (data.permissions && typeof data.permissions.edit_offers === 'undefined') {
		data.permissions.edit_offers = false;
	}

	// Add default delete offers permission
	if (data.permissions && typeof data.permissions.delete_offers === 'undefined') {
		data.permissions.delete_offers = false;
	}

	// Avoid require payment method
	if (typeof data.has_payment_method === 'boolean') {
		data.has_payment_method = true;
	}

	if (typeof data.has_payment_method === 'boolean' && !data.has_payment_method && data.access_token) {
		data.access_token = '...';
	}

	return data;
};
