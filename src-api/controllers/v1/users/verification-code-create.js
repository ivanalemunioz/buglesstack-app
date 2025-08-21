const uid = require('rand-token').uid;
const ejs = require('ejs');

const { validateData } = require('../../../libraries/DataValidation/index');
const { sendEmail } = require('../../../libraries/AmazonSES/index');
const { authentication, roles } = require('../../../libraries/Session/index');

const verifyCodeModel = require('../../../models/verifyCode/index');
const userModel = require('../../../models/user/index');

// Data validation rules
const rules = [
	{
		name: 'email',
		title: 'Email',
		rules: ['required', 'email', { rule: 'max_length', value: 200 }]
	}
];

/**
 * Create user
 **/
module.exports = [authentication(roles.WITHOUT_CREDENTIALS), validateData(rules), (req, res, next) => (async () => {
	// Create random code
	let code = uid(6).toUpperCase();

	// Allways use lowercase email
	const email = req.body.email.toLowerCase();

	// Required for test in App Store
	if (email === 'ivanalemunioz@gmail.com') {
		code = '123ABC';
	}

	// Prepare data
	const data = {
		code,
		updated_at: new Date()
	};

	// check if exists verify code for this address
	let verifyCode = await verifyCodeModel.getByMethodAndAddress('email', email);
    
	if (verifyCode) {
		await verifyCodeModel.edit(verifyCode.id, data);
	}
	else {
		data.address = email;
		data.method = 'email';
		data.created_at = new Date();

		verifyCode = await verifyCodeModel.create(data);
	}

	const user = await userModel.getByEmail(email);

	// Avoid send dev code email
	if (process.env.ENV === 'production' && email !== 'ivanalemunioz@gmail.com') {
		// Email html
		const html = await ejs.renderFile('./src-api/views/email/verify-code.ejs', {
			verify_code: code
		});

		// Send email
		await sendEmail({
			Source: 'Buglesstack <no-reply@buglesstack.com>',
			Destination: { ToAddresses: [email] },
			Message: { 
				Subject: {
					Charset: 'UTF-8',
					Data: 'Verification code'
				},
				Body: {
					Html: {
						Charset: 'UTF-8',
						Data: html
					}
				}
			}
		});
	}
	else {
		console.log(data);
	}

	await res.json({ id: verifyCode.id, exists: !!user });
})().catch(next)];
