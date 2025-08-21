const sessionTokenModel = require('../../models/sessionToken/index');
const projectModel = require('../../models/project/index');
const { getFields } = require('../ModelCore/utils');

/**
 * Session authentication middleware for multiple roles 
 **/
module.exports = (...roles) => (req, res, next) => (async () => {
	// Check access token
	if (req.query.access_token || req.headers.authorization) {
		let accessToken;

		if (req.headers.authorization) {
			accessToken = req.headers.authorization.split(' ')[1];
		}
		else {
			accessToken = req.query.access_token;
		}

		// Check each role
		for (let i = 0; i < roles.length; i++) {
			let sessionToken;

			if (roles[i] === 'project') {
				const project = await projectModel.getByAccessToken(accessToken, {
					select: getFields('project', '__DEFAULT__', [
						'status',
						'subscription_current_period_end',
						'billing_plan',
						'crashes_limit',
						'current_period_crashes_usage'
					])
				});

				if (project && project.status === 'active') {
					req.project = project;

					return next();
				}
			}

			if (roles[i] === 'customer') {
				sessionToken = await sessionTokenModel.getByAccessToken(accessToken);
                
				if (!(
					sessionToken && // Exists 
                    roles[i] === sessionToken.role && // The role can access
                    sessionToken.expires_at.getTime() > Date.now() // Isn't expired
				)) {
					continue;
				}
			}

			if ((sessionToken && sessionToken.user.status === 'deleted')) {
				return res.send(400, { 
					error_header: 'Warning!', 
					error_message: 'Your account has been deleted. Please contact support for more information.', 
					dismiss: false 
				});
			}

			if (sessionToken) {
				req.session = sessionToken;
                
				return next();
			}
		}
	}

	// To allow access without credentials
	if (roles.indexOf('WITHOUT_CREDENTIALS') !== -1) {
		return next();
	}

	// If no access token is provided, return 401 Unauthorized
	res.send(401, {
		message: 'No access token provided.'
	});
})().catch(next);
