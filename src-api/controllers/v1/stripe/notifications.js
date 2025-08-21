const projectModel = require('../../../models/project/index');

const { getEvent, getSubscription } = require('../../../libraries/Stripe');

/**
 * Stripe notifications
 **/
module.exports = [(req, res, next) => (async () => {
	let event;
  
	try {
		event = await getEvent(req.body.id);
	}
	catch (err) {
		return res.send(400, 'Webhook Error');
	}

	// Log the notification data
	{
		console.log('Stripe notification');
        
		console.log('event');
		console.log(event);

		console.log('~~ END ~~');
	}

	if (
		// customer.subscription.updated -> Sent when a subscription starts or changes
		event.type === 'customer.subscription.updated' || 
		// customer.subscription.deleted -> Sent when a subscription is canceled
		event.type === 'customer.subscription.deleted'
	) {
		// Get subscription details
		const subscription = await getSubscription(event.data.object.id);

		// Get project for the subscription
		const project = await projectModel.getByStripeSubscriptionId(subscription.id);

		// Check if there is a project for the subscription
		if (project) {
			// Save subscription info for the project
			await projectModel.updateStripeSubscripcionData(project.id, subscription);
		}
	}

	// Send response
	res.send({ status: 'ok' });
})().catch(next)];
