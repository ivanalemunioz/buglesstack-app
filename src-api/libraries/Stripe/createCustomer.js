module.exports = async function (email) {
	return this.StripeClient.customers.create({
		email
	});
};
