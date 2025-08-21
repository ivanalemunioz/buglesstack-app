module.exports = async function (id, data) {
	return this.StripeClient.subscriptions.resume(id, data);
};
