const { validateData } = require('../../../libraries/DataValidation/index');
const { authentication, roles } = require('../../../libraries/Session/index');
const { sendEmail } = require('../../../libraries/AmazonSES/index');

const userModel = require('../../../models/user/index');
const verifyCodeModel = require('../../../models/verifyCode/index');
const sessionTokenModel = require('../../../models/sessionToken/index');

// Data validation rules
const rules = [
	{
		name: 'email',
		title: 'Email',
		rules: ['required', 'email']
	},
	{
		name: 'verification_code',
		title: 'Verification code',
		rules: ['required', 'string']
	},
	{
		name: 'metadata',
		title: 'Metadata',
		rules: ['required'],
		properties: [
			{
				name: 'source',
				title: 'How did you hear about Buglesstack?',
				rules: ['required', { rule: 'enum', value: ['recomendation', 'youtube', 'blog', 'github', 'google', 'no_memory', 'other'] }]
			}
		]
	}
];

/**
 * Create customer
 **/
module.exports = [authentication(roles.WITHOUT_CREDENTIALS), validateData(rules), (req, res, next) => {
	(async () => {
	// Allways use email in lowercase
		const email = req.body.email.toLowerCase();

		// Get verify code
		const verifyCode = await verifyCodeModel.getByMethodAndAddress('email', email);

		// Check if verify code exists and is not expired
		if (!verifyCode || verifyCode.code !== req.body.verification_code.toUpperCase() || verifyCode.updated_at < new Date(Date.now() - 600000)) {
			const error = new Error('Invalid data');
			error.avoidLogging = true;
			error.statusCode = 400;
			error.data_errors = { verification_code: 'The verification code is incorrect or has expired.' };

			return next(error);
		}

		// Delete used verify code
		await verifyCodeModel.delete(verifyCode.id);

		const actualUser = await userModel.getByEmail(email);

		if (actualUser) {
			return res.send(400, { 
				error_header: 'An error has occurred', 
				error_message: 'A user with the entered email already exists.' 
			});
		}

		const data = {
			email,
			updated_at: new Date(),
			created_at: new Date(),
			status: 'active',
			role: 'customer',
			metadata: {
				source: req.body.metadata.source
			}
		};

		// Create
		const user = await userModel.create(data);

		// Notify new user
		await sendEmail({
			Source: 'Ivan from Buglesstack <ivan@buglesstack.com>',
			Destination: { ToAddresses: ['ivanalemunioz@gmail.com'] },
			Message: {
				Subject: {
					Charset: 'UTF-8',
					Data: 'New user created'
				},
				Body: {
					Html: {
						Charset: 'UTF-8',
						Data: `
						Hello, a new user has been created.<br/>
						<br/>
						Email: ${email}<br/>
						<br/>
						Created at: ${data.created_at.toISOString()}<br/>
						<br/>
						Have a great day,<br/>  
						Ivan
					`
					}
				}
			}
		});

		// Prepare session token data
		const sessionTokenData = {
			user_id: user.id,
			role: 'customer'
		};

		// Create session token
		let sessionToken = await sessionTokenModel.createDefault(sessionTokenData);

		// Get all session token data
		sessionToken = await sessionTokenModel.getById(sessionToken.id);

		// Send session token
		await res.send(200, sessionToken);
	})().catch(next);
}];
