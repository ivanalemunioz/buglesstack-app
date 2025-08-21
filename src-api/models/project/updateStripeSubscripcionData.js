module.exports = async function updateStripeSubscripcionData (id, stripeSubscription) {
	// console.log('----------------------------');
	// console.log('updateStripeSubscripcionData');
	// console.log('id', id);
	// console.log('stripeSubscription', stripeSubscription);
	// console.log('----------------------------');
	
	// Prepare new subscription info for the project
	const data = {
		updated_at: new Date(),
		subscription_status: stripeSubscription.status,
		subscription_trial_end: new Date(stripeSubscription.trial_end * 1000),
		subscription_current_period_end: new Date(stripeSubscription.current_period_end * 1000),
		subscription_current_period_start: new Date(stripeSubscription.current_period_start * 1000),
		subscription_cancel_at: stripeSubscription.cancel_at ? new Date(stripeSubscription.cancel_at * 1000) : null
	};

	// console.log('----------------------------');
	// console.log('updateStripeSubscripcionData');
	// console.log(data);
	// console.log('----------------------------');
	
	// Save subscription info for the project
	return await this.edit(id, data);
};
