const Router = require('restify-router').Router;

const router = new Router();

/**
 * Set routes 
 **/
router.post('/auth', require('./auth'));
router.del('/auth', require('./delete-auth'));
router.post('/verification-code', require('./verification-code-create'));
router.post('', require('./create'));
router.get('/me', require('./details'));

module.exports = router;
