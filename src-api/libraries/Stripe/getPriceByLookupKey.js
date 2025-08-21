module.exports = async function (lookupKey) {
	const { data: [price] } = await this.StripeClient.prices.list({
		lookup_keys: [lookupKey]
	});

	return price;
};
