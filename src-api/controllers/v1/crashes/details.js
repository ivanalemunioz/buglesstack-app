const { getFields, createFields } = require('../../../libraries/ModelCore/utils');
const { authentication, roles: { CUSTOMER } } = require('../../../libraries/Session/index');

const crashModel = require('../../../models/crash/index');
const userProjectModel = require('../../../models/userProject/index');

/**
 * Get crash details
 **/
module.exports = [authentication(CUSTOMER), (req, res, next) => (async () => {
	// Prapare options for query
	const options = { select: getFields('crash', req.session.user.role) };

	// Get crash details
	const crash = await crashModel.getById(req.params.id, options);
    
	const error = new Error('Crash not found');
	error.statusCode = 404;

	// If crash not found, throw error
	if (!crash) {
		throw error;
	}

	// Get the user project
	const userProject = await userProjectModel.getByUserAndProject(req.session.user.id, crash.project.id, { select: createFields(['id']) });
	
	// If user project not found, throw error
	if (!userProject) {
		throw error;	
	}

	// TODO: Add s3 sign to links 

	// Send crash
	await res.json(crash);
})().catch(next)];
