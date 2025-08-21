const { Router } = require('restify-router');

const router = new Router();

/**
 * Set routes 
 **/
router.post('/notifications', require('./notifications'));

module.exports = router;
