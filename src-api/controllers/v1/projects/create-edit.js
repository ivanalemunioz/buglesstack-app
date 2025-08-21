const uid = require('rand-token').uid;

const { validateData } = require('../../../libraries/DataValidation/index');
const { authentication, roles: { CUSTOMER } } = require('../../../libraries/Session/index');
const { 
	createCustomer,
	createSubscription,
	updateSubscription,
	getPriceByLookupKey,
	getSubscription
} = require('../../../libraries/Stripe');

const projectModel = require('../../../models/project/index');
const userProjectModel = require('../../../models/userProject/index');
const { getFields, createFields } = require('../../../libraries/ModelCore/utils');

// Data validation rules
const rules = [
	{
		name: 'name',
		title: 'Name',
		rules: ['required', { rule: 'min_length', value: 5 }, { rule: 'max_length', value: 20 }]
	},
	{
		name: 'billing_plan',
		title: 'Billing plan',
		rules: ['required', { rule: 'enum', value: ['dev', 'pro'] }]
	},
	{
		name: 'billing_period',
		title: 'Billing period',
		rules: ['required', { rule: 'enum', value: ['monthly', 'yearly'] }]
	}
];

/**
 * Create project
 **/
module.exports = [authentication(CUSTOMER), validateData(rules), (req, res, next) => (async () => {
	// Check if is creating a new project
	const creating = !req.params.userProjectId;

	// Prepare access token variable
	let accessToken;

	// Prapare user project variable
	let userProject;

	// Prapare options for query
	const userProjectOptions = {
		select: createFields([
			'id',
			'user_id',
			'role',
			'REFERENCE.project',
			'project.id',
			'project.stripe_subscription_id',
			'project.subscription_status',
			'project.billing_plan',
			'project.billing_period'
		], 'user_project') 
	};

	// Get all user projects
	const projects = await userProjectModel.getAllByUser(req.session.user.id, userProjectOptions);
	
	// Set default options for dev plans
	if (req.body.billing_plan === 'dev') {
		req.body.billing_period = 'monthly'; // Free plan is only monthly
	}

	if (creating) {
		// Check limit of 10 projects
		if (projects.length >= 10 && process.env.ENV !== 'dev') {
			return res.send(400, { 
				error_header: 'You cannot have more than 10 projects', 
				error_message: 'If you need help managing your projects, please contact us.' 
			});
		}

		// Check if the user already has a dev project
		if (req.body.billing_plan === 'dev' && process.env.ENV !== 'dev') {
			const devProjects = projects.filter(p => p.project.billing_plan === 'dev' && p.project.subscription_status !== 'canceled');
			
			if (devProjects.length > 0) {
				return res.send(400, { 
					error_header: 'You already have a free project', 
					error_message: 'If you need help managing your projects, please contact us.' 
				});
			}
		}

		// Generate unique access token
		do {
			// Generate access token
			accessToken = uid(64);
		}
		while (await projectModel.getByAccessToken(accessToken));
	}
	else {
		// Get the user project
		userProject = await userProjectModel.getById(req.params.userProjectId, userProjectOptions);

		// Check if the user already has a dev project
		if (userProject.project.billing_plan !== req.body.billing_plan && req.body.billing_plan === 'dev' && process.env.ENV !== 'dev') {
			// Check if the user already has a dev project
			const devProjects = projects.filter(p => p.project.billing_plan === 'dev' && p.project.subscription_status !== 'canceled' && p.id !== req.params.userProjectId);
			
			if (devProjects.length > 0) {
				return res.send(400, { 
					error_header: 'You already have a free project', 
					error_message: 'If you need help managing your projects, please contact us.' 
				});
			}
		}

		// Check if project exists
		if (!userProject || userProject.user_id !== req.session.user.id) {
			throw new Error('Project not found');
		}

		// Check if has the permission to execute te action
		if (userProject.role !== 'owner') {
			return res.send(405, 'Action not allowed');
		}

		// Check if the suscription is not canceled
		if (userProject.project.subscription_status === 'canceled') {
			return res.send(405, 'Action not allowed');
		}
	}

	// Create the Stripe customer (one new customer per project)
	let stripeCustomer;

	// Prepare subscription data
	// https://docs.stripe.com/api/subscriptions/create
	const subscriptionData = {
		description: req.body.name,
		items: []
	};

	if (creating) {
		stripeCustomer = await createCustomer(req.session.user.email);

		subscriptionData.customer = stripeCustomer.id;
		subscriptionData.payment_behavior = 'default_incomplete';
		subscriptionData.trial_period_days = req.body.billing_plan === 'dev' ? 0 : 14; // 14-day trial for non dev projects
		// days_until_due: 0, // Charge immediately at the end of the trial
		// off_session: true, // Activate when the customer is not in the session (in the moment to move old subscription to Stripe)
		subscriptionData.collection_method = 'charge_automatically'; // Charge automatically at the end of the trial	
		subscriptionData.trial_settings = {
			end_behavior: {
				missing_payment_method: 'pause' // Pause subscription if payment method is missing when trial ends
			}
		};
	}
	
	// Get billing plan price
	const billingPlanPrice = await getPriceByLookupKey(`${req.body.billing_plan}_${req.body.billing_period}`);

	// Add billing plan to subscription
	subscriptionData.items.push({
		price: billingPlanPrice.id,
		product: billingPlanPrice.product
	});

	let subscription;

	if (creating) {
		// Remove product id (used in edit)
		for (let i = 0; i < subscriptionData.items.length; i++) {
			delete subscriptionData.items[i].product;
		}

		// If the billing plan is dev, set missing_payment_method to create_invoice
		if (req.body.billing_plan === 'dev' && subscriptionData.items.length === 1) {
			subscriptionData.trial_settings.end_behavior.missing_payment_method = 'create_invoice'; // Create invoice if payment method is missing when trial ends
		}

		// Create subscription
		subscription = await createSubscription(subscriptionData);
	}
	else {
		// If the billing plan is not dev, set missing_payment_method to pause
		if (req.body.billing_plan !== 'dev') {
			subscriptionData.payment_behavior = 'default_incomplete';
		}

		subscription = await getSubscription(userProject.project.stripe_subscription_id);

		// Search old subscription items in new items to set to be updated or deleted
		for (let i = 0; i < subscription.items.data.length; i++) {
			const subscriptionItem = subscription.items.data[i];

			const updatedSubscriptionItem = subscriptionData.items.find(i => i.product === subscriptionItem.price.product);

			// Check if the produc exist in the items
			if (updatedSubscriptionItem) {
				// Remove the updated item if is the same price
				if (subscriptionItem.price.id === updatedSubscriptionItem.price) {
					subscriptionData.items.splice(subscriptionData.items.findIndex(i => i.product === subscriptionItem.price.product), 1);
				}
				// Set the subscription item to update
				else {
					updatedSubscriptionItem.id = subscriptionItem.id;
				}
			}
			// Set to delete
			else {
				subscriptionData.items.push({
					id: subscriptionItem.id,
					deleted: true
				});
			}
		}

		// console.log(subscriptionData);
		// throw new Error('error');

		// Remove product id (used in edit)
		for (let i = 0; i < subscriptionData.items.length; i++) {
			delete subscriptionData.items[i].product;
		}

		// Delete items if there is nothing to update
		if (subscriptionData.items.length === 0) {
			delete subscriptionData.items;
		}

		// Update subscription
		subscription = await updateSubscription(userProject.project.stripe_subscription_id, subscriptionData);
	}

	// Prepare project data
	const data = {
		name: req.body.name,
		billing_plan: req.body.billing_plan,
		billing_period: req.body.billing_period,
		subscription_status: subscription.status,
		subscription_trial_end: new Date(subscription.trial_end * 1000),
		subscription_current_period_end: new Date(subscription.current_period_end * 1000),
		subscription_current_period_start: new Date(subscription.current_period_start * 1000),
		updated_at: new Date()
	};

	// Set tax_id_limit and request_limit based on billing plan
	if (req.body.billing_plan === 'dev') {
		data.crashes_limit = req.body.billing_period === 'monthly' ? 5000 : 60000;
	}
	else if (req.body.billing_plan === 'pro') {
		data.crashes_limit = req.body.billing_period === 'monthly' ? 50000 : 600000;
	}

	// Prepare user project data
	let userProjectData;

	if (creating) {
		data.created_at = new Date();
		data.status = 'active';
		data.access_token = accessToken;
		data.stripe_subscription_id = subscription.id;
		data.stripe_customer_id = stripeCustomer.id;
		
		// Prepare user project data
		userProjectData = {
			user_id: req.session.user.id,
			project_id: null, // Will be assigned later
			role: 'owner',
			created_at: new Date(),
			updated_at: new Date()
		};
	}

	if (creating) {
		// Create project
		const project = await projectModel.create(data);

		// Assign project to user
		userProjectData.project_id = project.id;
		userProject = await userProjectModel.create(userProjectData);
	}
	else {
		// Update project
		await projectModel.edit(userProject.project.id, data);
	}

	// Prapare options for query
	const options = { select: getFields('user_project', req.session.user.role) };
	
	// Get use project
	userProject = await userProjectModel.getById(userProject.id, options);

	// Send response
	await res.send(200, userProject);
})().catch(next)];
