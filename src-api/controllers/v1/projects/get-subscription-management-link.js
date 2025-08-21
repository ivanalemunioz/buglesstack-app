const { authentication, roles: { CUSTOMER } } = require('../../../libraries/Session/index');
const { createBillingPortalSession, updateSubscription } = require('../../../libraries/Stripe');

const userProjectModel = require('../../../models/userProject/index');
const projectModel = require('../../../models/project/index');

const { createFields } = require('../../../libraries/ModelCore/utils');
const { validateData } = require('../../../libraries/DataValidation');

// Data validation rules
const rules = [
	{
		name: 'flow',
		title: 'Flow',
		rules: [{ rule: 'enum', value: ['subscription_cancel', 'subscription_reactivate', 'payment_method_update'] }]
	}
];
/**
 * Get user tax ids
 **/
module.exports = [authentication(CUSTOMER), validateData(rules), (req, res, next) => (async () => {
	// Prapare options for query
	const options = {
		select: createFields([
			'id',
			'user_id',
			'role',
			'REFERENCE.project',
			'project.id',
			'project.stripe_subscription_id',
			'project.stripe_customer_id'
		], 'user_project') 
	};

	// Get the user projects
	const userProject = await userProjectModel.getById(req.params.userProjectId, options);
    
	// Check if project exists
	if (!userProject || userProject.user_id !== req.session.user.id) {
		throw new Error('Project not found');
	}

	// Check if has the permission to execute te action
	if (userProject.role !== 'owner') {
		return res.send(405, 'Action not allowed');
	}
	
	// Prepare data for the billing portal session
	const billingPortalSessionData = {
		customer: userProject.project.stripe_customer_id,
		return_url: process.env.ENV === 'production' ? 'https://app.buglesstack.com/billing' : req.header('Referer') + 'billing'
	};

	// Check if is subscription_cancel flow
	if (req.query.flow === 'subscription_cancel') {
		billingPortalSessionData.flow_data = {
			type: 'subscription_cancel',
			subscription_cancel: {
				subscription: userProject.project.stripe_subscription_id
			}
		};
	}
	// Reactivate subscription if required
	else if (req.query.flow === 'subscription_reactivate') {
		const subscription = await updateSubscription(userProject.project.stripe_subscription_id, {
			cancel_at_period_end: false
		});

		// Save subscription info for the project
		await projectModel.updateStripeSubscripcionData(userProject.project.id, subscription);

		// Send response
		return await res.json({ status: 'ok' });
	}
	// Update payment method
	else if (req.query.flow === 'payment_method_update') {
		billingPortalSessionData.flow_data = {
			type: 'payment_method_update'
		};
	}

	// Create billing portal session
	const billingPortalSession = await createBillingPortalSession(billingPortalSessionData);

	// Prepare response
	const response = {
		billing_portal_session_id: billingPortalSession.id,
		link: billingPortalSession.url
	};
	
	// Send response
	await res.json(response);
})().catch(next)];
