// Require the models module to initialize them
require('../../models/index');

const Cors = require('restify-cors-middleware2');
const restify = require('restify');
const fs = require('fs');
const { join } = require('path');
const Sentry = require('@sentry/node');
const mime = require('mime');

// const errorModel = require('../../models/error/index');

const { configRoutes } = require('./routes');

const server = restify.createServer();

if (process.env.BACK_SENTRY_DSN) {
	// The request handler must be the first middleware on the app
	server.use(Sentry.Handlers.requestHandler());
	
	// TracingHandler creates a trace for every incoming request
	server.use(Sentry.Handlers.tracingHandler());
}
  
/* Config CORS */
const cors = Cors({ 
	origins: ['*'], 
	allowHeaders: ['library-version-number', 'library-lang', 'authorization', 'baggage', 'sentry-trace'], 
	exposeHeaders: ['app-message']
});
server.pre(cors.preflight);
server.use(cors.actual);

/* Config plugins */
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

/* Handle error */
server.on('restifyError', catchError);

/* Add environment */
server.use((req, _res, next) => {
	// Sdk library
	req.sdk_library = (['javascript']).indexOf(req.headers['sdk-library']) > -1 ? req.headers['sdk-library'] : undefined;

	// Continue middlewares
	next();
});

function catchError (req, res, err, callback) {
	// Set 400 as default status code and force it to be greater or equal than 400
	// err.statusCode = Math.max(err.statusCode || 400, 400);
	// err.statusMessage = err.message || undefined;
	
	if (!err.avoidLogging) {
		if (process.env.BACK_SENTRY_DSN) {
			Sentry.setUser(req.session ? { 
				id: req.session.user.id,
				email: req.session.user.email
			} : (req.project ? { id: `proj_${req.project.id}` } : null));
			
			Sentry.captureException(err);
		}
	}
	else {
		delete err.avoidLogging;
	}

	// Remove the raw property of Stripe errors to avoid leaking information
	if (err.raw) {
		delete err.raw;
	}

	// Remove the headers property of Stripe errors to avoid leaking information
	if (err.headers) {
		delete err.headers;
	}

	if (process.env.ENV === 'dev') {
		// Add error stack if exists
		if (err.stack) {
			err.errorStack = err.stack;
		}
		
		console.log(err);
	}
	else {
		console.log(err);
	}

	if (err.message) {
		Object.defineProperty(err, 'message', {
			value: err.message,
			writable: true,
			enumerable: true
		});
	}

	return callback();
}

// Add health endpoint
server.get('/health', function (_req, res) {
	res.json({ heartbeat: 'beating' });
});

// Config routes
configRoutes(server);

// Serve static html
server.get('/*', function (req, res) {
	const filepath = join(__dirname, '/../../../build', req.path().replace(/\.\.\//g, ''));
    
	try {
		// const mime = Mime
		const mimeType = mime.getType(filepath);

		res.setHeader('content-type', `${mimeType}; charset=UTF-8`);
    	res.end(fs.readFileSync(filepath));
	}
	catch (error) {
		// console.log(error);
		// TODO, sned 404
		res.setHeader('content-type', 'text/html; charset=UTF-8');
		res.end(fs.readFileSync(join(__dirname, '/../../../build/index.html')));
	}
});

/**
 * Server instance
 **/
module.exports.server = server;

/**
 * Start server listening
 **/
module.exports.startServer = () => {
	return server.listen(process.env.PORT || 5100, function () {
		console.log('%s listening at %s', server.name, server.url);
	});
};
