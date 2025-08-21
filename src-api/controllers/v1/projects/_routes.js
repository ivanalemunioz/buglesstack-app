const Router = require('restify-router').Router;

const router = new Router();

/**
 * Set routes 
 **/
router.post('', require('./create-edit'));
router.post('/:userProjectId', require('./create-edit'));
router.get('', require('./get'));
router.get('/:userProjectId/subscription-management-link', require('./get-subscription-management-link'));

module.exports = router;
