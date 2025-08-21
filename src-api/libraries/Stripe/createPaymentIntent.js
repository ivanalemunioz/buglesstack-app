module.exports = async function (data) {
	return this.StripeClient.paymentIntents.create(data);
};
