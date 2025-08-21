const { createFields } = require('../../../libraries/ModelCore/utils');

const sessionTokenModel = require('../../../models/sessionToken/index');

/**
 * Delete authentication
 **/
module.exports = [(req, res, next) => (async () => {
	let accessToken;

	if (req.headers.authorization) {
		accessToken = req.headers.authorization.split(' ')[1];
	}
	else if (req.query.access_token) {
		accessToken = req.query.access_token;
	}
	else {
		throw new Error('Invalid credentials');
	}

	const sessionToken = await sessionTokenModel.getByAccessToken(accessToken, { select: createFields(['id']) });

	// Check than exists
	if (sessionToken !== null) {
		await sessionTokenModel.delete(sessionToken.id);
	}

	res.json({ status: 'ok' });
})().catch(next)];
