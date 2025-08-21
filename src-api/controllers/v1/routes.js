const Router = require('restify-router').Router;

const router = new Router();

/**
 * Set routes 
 **/
router.add('/users', require('./users/_routes'));
router.add('/crashes', require('./crashes/_routes'));
router.add('/stripe', require('./stripe/_routes'));
router.add('/projects', require('./projects/_routes'));

module.exports = router;
