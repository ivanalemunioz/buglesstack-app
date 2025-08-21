const { getFields, createFields } = require('../../../libraries/ModelCore/utils');
const { validateData } = require('../../../libraries/DataValidation/index');
const { authentication, roles: { CUSTOMER } } = require('../../../libraries/Session/index');

const crashModel = require('../../../models/crash/index');
const userProjectModel = require('../../../models/userProject/index');

// Rules for data validation
const rules = [
	{
		name: 'project_id',
		title: 'Project ID',
		rules: ['required', 'string']
	},
	{
		name: 'start',
		title: 'Last crash id',
		rules: ['string']
	}
];

/**
 * Get user crashes
 **/
module.exports = [authentication(CUSTOMER), validateData(rules), (req, res, next) => (async () => {
	// Get the user project
	const userProject = await userProjectModel.getByUserAndProject(req.session.user.id, req.query.project_id, { select: createFields(['id']) });
	
	if (!userProject) {
		const error = new Error('Project not found');
		error.statusCode = 404;

		throw error;	
	}

	// Prepare options for query
	const options = { select: getFields('crash', req.session.user.role) };

	// Get all the user crashes
	const crashes = await crashModel.getByProject(req.query.project_id, 20, req.query.start, options);
    
	// Send user crashes
	await res.json(crashes);
})().catch(next)];
