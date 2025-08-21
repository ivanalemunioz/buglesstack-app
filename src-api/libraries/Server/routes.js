const Router = require('restify-router').Router;

/**
 * Config server routes
 **/
module.exports.configRoutes = (server) => {
	// v2 API routes
	const v2Router = new Router();
	v2Router.add('/api/v1', require('../../controllers/v1/routes'));
	v2Router.applyRoutes(server);
};
