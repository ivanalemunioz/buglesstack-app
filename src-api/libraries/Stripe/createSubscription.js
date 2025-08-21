module.exports = async function (data) {
	return this.StripeClient.subscriptions.create(data);
};
