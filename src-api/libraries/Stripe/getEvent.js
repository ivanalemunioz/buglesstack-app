module.exports = async function (id) {
	return this.StripeClient.events.retrieve(id);
};
