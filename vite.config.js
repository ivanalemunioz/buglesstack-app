import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');

	return {
		build: {
			outDir: 'build'
		},
		plugins: [
			react()
		],
		resolve: {
			alias: [{ find: '@', replacement: '/src' }]
		},
		define: {
			'process.env': {
				MIXPANEL_TOKEN: env.MIXPANEL_TOKEN,
				NODE_ENV: env.NODE_ENV,
				ENV: env.ENV,
				FRONT_SENTRY_DSN: env.FRONT_SENTRY_DSN
			}
		},
		css: {
			preprocessorOptions: {
				scss: {
					silenceDeprecations: ['legacy-js-api']
				}
			}
		}        
	};
});
