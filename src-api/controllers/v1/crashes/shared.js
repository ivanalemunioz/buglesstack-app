const { getFields } = require('../../../libraries/ModelCore/utils');
const { roles: { CUSTOMER } } = require('../../../libraries/Session/index');

const crashModel = require('../../../models/crash/index');

/**
 * Get crash details
 **/
module.exports = [(req, res, next) => (async () => {
	// Prapare options for query
	const options = { select: getFields('crash', CUSTOMER, [], ['REFERENCE.project', 'project.id']) };

	// Get crash details
	const crash = await crashModel.getByShareToken(req.params.shareToken, options);
    
	const error = new Error('Crash not found');
	error.statusCode = 404;

	// If crash not found, throw error
	if (!crash) {
		throw error;
	}

	// Send crash
	await res.json(crash);
})().catch(next)];
