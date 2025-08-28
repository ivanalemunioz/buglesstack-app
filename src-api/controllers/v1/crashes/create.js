const Mixpanel = require('../../../libraries/Mixpanel/index');
const { validateData } = require('../../../libraries/DataValidation/index');
const { subscriptionActiveRequired } = require('../../../libraries/Billing');
const { authentication, roles: { PROJECT } } = require('../../../libraries/Session/index');

const crashModel = require('../../../models/crash/index');
const { uploadBase64Image, uploadHtmlContent } = require('../../../libraries/AmazonS3');

// Data validation rules
const rules = [
	{
		name: 'html',
		title: 'HTML',
		rules: ['required', 'string', { rule: 'max_length', value: 5000000 }] // 5MB
	},
	{
		name: 'screenshot',
		title: 'Screenshot',
		rules: ['required', 'string', { rule: 'max_length', value: 5000000 }] // 5MB
	},
	{
		name: 'url',
		title: 'URL',
		rules: ['required', 'string', { rule: 'max_length', value: 5000 }] // 5KB
	},
	{
		name: 'message',
		title: 'Message',
		rules: ['required', 'string', { rule: 'max_length', value: 1000 }] // 1KB
	},
	{
		name: 'stack',
		title: 'Stack',
		rules: ['required', 'string', { rule: 'max_length', value: 10000 }] // 10KB
	},
	{
		name: 'crashed_user_email',
		title: 'Crashed user email',
		rules: ['email']
	},
	{
		name: 'metadata',
		title: 'Metadata',
		rules: ['required', 'object', { rule: 'max_properties_length', value: 50 }] // 50 properties
	}
];

/**
 * Create crash
 **/
module.exports = [
	authentication(PROJECT), 
	validateData(rules), 
	subscriptionActiveRequired(), 

	(req, res, next) => (async () => {
		// Check if project has reached the crashes limit
		if (req.project && req.project.crashes_limit !== -1 && req.project.current_period_crashes_usage >= req.project.crashes_limit) {
			const error = new Error();
			error.statusCode = 400;
			error.message = `You have reached the limit of crashes you can use in this period. If you need to use more crashes, you can go to https://app.buglesstack.com/billing to change your plan. ID ${req.project.id}`;
			error.avoidLogging = true;

			throw error;
		}

		// Upload screenshot to S3
		const screenshotS3Promise = uploadBase64Image(req.body.screenshot);

		// Upload html to S3
		const htmlS3Promise = uploadHtmlContent(req.body.html);

		// Await for the responses
		const [screenshotS3Response, htmlS3Response] = await Promise.all([screenshotS3Promise, htmlS3Promise]);

		// Prepare crash data
		const data = {
			html: htmlS3Response.Location,
			screenshot: screenshotS3Response.Location,
			message: req.body.message,
			url: req.body.url,
			stack: req.body.stack,
			crashed_user_email: req.body.crashed_user_email,
			project_id: req.project.id,
			created_at: new Date(),
			updated_at: new Date(),

			// Parse metadata values to string
			metadata: Object.keys(req.body.metadata).reduce((acc, key) => {
				acc[key] = String(req.body.metadata[key]);

				return acc;
			}, {})
		};

		// Create crash
		const crash = await crashModel.create(data);

		// Track in mixpanel
		Mixpanel.client.track('crash', {
			$insert_id: crash.id,
			distinct_id: `proj_${req.project.id}`,
			crashed_user_email: req.body.crashed_user_email,
			message: req.body.message,
			time: Date.now()
		});

		const response = { 
			id: crash.id
		};
		
		if (process.env.OPEN_SOURCE !== 'true') {
			response.url = `https://app.buglesstack.com/crashes/${crash.id}`;
		}

		// Send event id
		await res.send(200, response);
	})().catch(next)
];
