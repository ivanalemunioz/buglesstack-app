module.exports = async function (id) {
	const { data } = await this.StripeClient.customers.listPaymentMethods(id, { type: 'card' });

	return data;
};
