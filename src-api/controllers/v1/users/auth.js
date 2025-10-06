const { validateData } = require('../../../libraries/DataValidation/index');
const { createFields } = require('../../../libraries/ModelCore/utils');

const userModel = require('../../../models/user/index');
const sessionTokenModel = require('../../../models/sessionToken/index');
const verifyCodeModel = require('../../../models/verifyCode/index');

// Data validation rules
const rules = [
	{
		name: 'type',
		title: 'Authentication type',
		rules: ['required', { rule: 'enum', value: ['verification_code', 'refresh_token'] }]
	}
];

// Rules for verification code authenticacion
const rulesForVerificationCode = [
	{
		name: 'email',
		title: 'Email',
		rules: ['required', 'email']
	},
	{
		name: 'verification_code',
		title: 'Verification code',
		rules: ['required', 'string']
	}
];

// Rules for refresh token authenticacion
const rulesForRefreshToken = [
	{
		name: 'refresh_token',
		title: 'Refresh token',
		rules: ['required', 'string']
	}
];

/**
 * Authenticate
 **/
module.exports = [validateData(rules), (req, res, next) => {
	(async () => {
		let rules, functionToCall;

		if (req.body.type === 'verification_code') {
			rules = [...rulesForVerificationCode];
			functionToCall = authenticateVerificationCode;
		}
		else if (req.body.type === 'refresh_token') {
			rules = [...rulesForRefreshToken];
			functionToCall = authenticateRefreshToken;
		}

		validateData(rules)(req, res, err => {
			if (err) {
				return next(err);
			}

			functionToCall(req, res, next).catch(next);
		});
	})().catch(next);
}];

/**
 * Function called when authenticate via verification code
 **/
const authenticateVerificationCode = (req, res, next) => (async () => {
	// Get user
	const user = await userModel.getByEmail(req.body.email, { select: createFields(['id', 'role']) });

	// Check if user exists
	if (user === null) {
		const error = new Error('Invalid data');
		error.statusCode = 400;
		error.data_errors = { email: 'No user exists with the entered email.' };

		return next(error);
	}

	const verifyCode = await verifyCodeModel.getByMethodAndAddress('email', req.body.email);

	// Check if verify code exists and is not expired
	if (!verifyCode || verifyCode.code !== req.body.verification_code.toUpperCase() || verifyCode.updated_at < new Date(Date.now() - 600000)) {
		const error = new Error('Invalid data');
		error.statusCode = 400;
		error.data_errors = { verification_code: 'The verification code is incorrect or has expired.' };

		return next(error);
	}

	// Delete user verify code
	await verifyCodeModel.delete(verifyCode.id);

	// Prepare data
	const data = {
		user_id: user.id,
		role: user.role
	};

	authenticate(req, res, next, data).catch(next);
})().catch(next);

/**
 * Function called when authenticate via refresh token
 **/
const authenticateRefreshToken = (req, res, next) => (async () => {
	const sessionToken = await sessionTokenModel.getByRefreshToken(req.body.refresh_token);
    
	// Check if refresh token exists and is not expired
	if (!sessionToken || !sessionToken.user || sessionToken.expires_at.getTime() <= (new Date()).getTime()) {
		throw new Error('Refresh token expired or used');
	}

	const data = {
		user_id: sessionToken.user.id,
		role: sessionToken.role
	};

	authenticate(req, res, next, data).catch(next);
})().catch(next);

/**
 * Final function to autheticate
 **/
const authenticate = (req, res, next, data) => (async () => {
	// Create session token
	let sessionToken = await sessionTokenModel.createDefault(data);

	// Get all session token data
	sessionToken = await sessionTokenModel.getById(sessionToken.id);

	// Send session token
	await res.send(200, sessionToken);

	// Delete old session token if required
	if (req.body.refresh_token) {
		const oldSessionToken = await sessionTokenModel.getByRefreshToken(req.body.refresh_token);

		await sessionTokenModel.delete(oldSessionToken.id);
	}
})().catch(next);
