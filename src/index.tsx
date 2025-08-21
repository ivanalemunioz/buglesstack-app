import { render } from 'react-dom';
import { setupIonicReact } from '@ionic/react';
import * as Sentry from '@sentry/react';

import App from './App';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
// import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
// import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
// import '@ionic/react/css/padding.css';
// import '@ionic/react/css/float-elements.css';
// import '@ionic/react/css/text-alignment.css';
// import '@ionic/react/css/text-transformation.css';
// import '@ionic/react/css/flex-utils.css';
// import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

import './index.scss';
import './index.css';

// Initialize Sentry
Sentry.init({
	dsn: process.env.FRONT_SENTRY_DSN,
	integrations: [
	  Sentry.browserTracingIntegration(),
	  Sentry.replayIntegration({
			maskAllText: false,
			blockAllMedia: false
	  })
	],
	// Performance Monitoring
	tracesSampleRate: 1.0, //  Capture 100% of the transactions
	// Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
	tracePropagationTargets: ['localhost', /^https:\/\/app\.buglesstack\.com\/api/],
	// Session Replay
	replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
	replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
	environment: process.env.ENV
});

// Initialize ionic
setupIonicReact({
	rippleEffect: false,
	mode: 'ios'
});

const container = document.getElementById('root');

render(<App />, container);
