import axios from 'axios';

import InfoHelper from '@/libraries/InfoHelper';

/**
 * URL of the server
 **/
export const baseURL = process.env.NODE_ENV === 'production' 
// Production URL
	? 'https://app.buglesstack.com/api/'
	
// Development URL
	: 'http://localhost:5100/api/'
;

/**
 * Axios client to make the requests to server
 **/
const server = axios.create({
	baseURL,
	timeout: 30000
});

// Add handler for error and info messages
server.interceptors.response.use(res => {
	if (res.headers['app-message']) {
		try { 
			const messageString = res.headers['app-message'];

			// Try to convert message to json
			const message = messageString && JSON.parse(messageString);

			// Check if exists message to show
			if (message) {
				InfoHelper.showAlert({
					header: message.header,
					subHeader: message.message,
					buttons: message.dismiss !== false ? ['Got it'] : [],
					backdropDismiss: message.dismiss !== false
				});
			}
		}
		catch (e) {}
	}

	return res;
}, error => {
	// Check if exists error message to show
	if (error?.response?.data?.error_message) {
		InfoHelper.showErrorAlert({
			header: error.response.data.error_header,
			subHeader: error.response.data.error_message,
			buttons: error.response.data.dismiss !== false ? ['Got it'] : [],
			backdropDismiss: error.response.data.dismiss !== false
		});
	}

	return Promise.reject(error);
});

export default server; 
