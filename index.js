// Initialize dotenv
require('dotenv').config();

// Create OPEN_SOURCE env variable
process.env.OPEN_SOURCE = String(!process.env.STRIPE_LIVE_SECRET_KEY);

if (process.env.BACK_SENTRY_DSN) {
	const Sentry = require('@sentry/node');
	const { nodeProfilingIntegration } = require('@sentry/profiling-node');

	Sentry.init({
		dsn: process.env.BACK_SENTRY_DSN,
		integrations: [
		// enable HTTP calls tracing
			new Sentry.Integrations.Http({ tracing: true }),
			nodeProfilingIntegration()
		],
		// Performance Monitoring
		tracesSampleRate: 1.0, //  Capture 100% of the transactions
		// Set sampling rate for profiling - this is relative to tracesSampleRate
		profilesSampleRate: 1.0,

		environment: process.env.ENV || 'prod'
	});
}

const { startServer } = require('./src-api/libraries/Server/index');

// Start server
startServer();
