const Router = require('restify-router').Router;

const router = new Router();

/**
 * Set routes 
 **/
router.post('', require('./create'));
router.get('', require('./get'));
router.get('/:id', require('./details'));
router.get('/shared/:shareToken', require('./shared'));

module.exports = router;
