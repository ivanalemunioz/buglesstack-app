module.exports = async function (id, data) {
	return this.StripeClient.subscriptions.update(id, data);
};
