module.exports = async function (data) {
	return this.StripeClient.billingPortal.sessions.create(data);
};
