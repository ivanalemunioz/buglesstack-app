const userModel = require('../../models/user/index');
const { createFields } = require('../../libraries/ModelCore/utils');

module.exports = async function (email) {
	// Get user
	const user = await userModel.getByEmail(email, { select: createFields(['id', 'stripe_customer_id']) });

	let customer;

	// Try to get by stripe customer id
	if (user.stripe_customer_id && process.env.ENV === 'production') {
		customer = await this.getCustomerById(user.stripe_customer_id);
	}
	// Try to get by email. At the beginning the 
	// user.stripe_customer_id was not saved so there are customers
	// that has theid stripe customer  withoud a user.stripe_customer_id saved
	else {
		customer = await this.getCustomer(email);
	}

	// Create stripe customer if it do not exist
	if (!customer) {
		customer = await this.createCustomer(email);
	}

	// Save stripe customer if was not saved before
	if (!user.stripe_customer_id && customer && process.env.ENV === 'production') {
		await userModel.edit(user.id, { stripe_customer_id: customer.id });
	}
    
	return customer;
};
