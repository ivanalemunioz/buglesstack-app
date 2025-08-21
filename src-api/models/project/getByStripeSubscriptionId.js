module.exports = async function getByAccessToken (stripeSubscriptionId, options) {
	const query = this.query
		.where('stripe_subscription_id', '=', stripeSubscriptionId)
		.limit(1);

	const { rows: [row] } = await query.get();

	return this.map(row, options);
};
