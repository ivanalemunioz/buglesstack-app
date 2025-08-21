module.exports = async function (data) {
	return this.StripeClient.checkout.sessions.create(data);
};
