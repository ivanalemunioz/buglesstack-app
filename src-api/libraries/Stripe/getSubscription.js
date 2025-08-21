module.exports = async function (id) {
	return this.StripeClient.subscriptions.retrieve(id);
};
