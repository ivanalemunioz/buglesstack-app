const { authentication, roles: { CUSTOMER } } = require('../../../libraries/Session/index');

const userProjectModel = require('../../../models/userProject/index');
const { getFields } = require('../../../libraries/ModelCore/utils');

/**
 * Get user tax ids
 **/
module.exports = [authentication(CUSTOMER), (req, res, next) => (async () => {
	// Prapare options for query
	const options = { select: getFields('user_project', req.session.user.role) };

	// Get all the user projects
	const projects = await userProjectModel.getAllByUser(req.session.user.id, options);
    
	// Send user tax ids
	await res.json(projects);
})().catch(next)];
