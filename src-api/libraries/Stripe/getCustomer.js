module.exports = async function (email) {
	const { data: [customer] } = await this.StripeClient.customers.search({
		query: `email~"${email}"`
	});

	return customer;
};
