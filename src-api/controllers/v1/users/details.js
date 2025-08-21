const { getFields } = require('../../../libraries/ModelCore/utils');
const { authentication, roles: { CUSTOMER } } = require('../../../libraries/Session/index');

const userModel = require('../../../models/user/index');

/**
 * Get user details
 **/
module.exports = [authentication(CUSTOMER), (req, res, next) => (async () => {
	// Fields for the model
	const select = getFields('user', req.session.user.role);

	// Get user
	const user = await userModel.getById(req.session.user.id, { select });

	res.json(user);
})().catch(next)];
