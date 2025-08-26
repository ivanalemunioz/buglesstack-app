module.exports = async function (email) {
	// Try to get by email
	let customer = await this.getCustomer(email);

	// Create stripe customer if it do not exist
	if (!customer) {
		customer = await this.createCustomer(email);
	}

	return customer;
};
