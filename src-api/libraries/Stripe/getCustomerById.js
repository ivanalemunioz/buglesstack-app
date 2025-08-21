module.exports = async function (id) {
	return this.StripeClient.customers.retrieve(id);
};
