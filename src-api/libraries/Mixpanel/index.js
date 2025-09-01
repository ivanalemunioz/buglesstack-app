const Mixpanel = require('mixpanel');

const { MixpanelConfig } = require('../../config/credentials');

if (MixpanelConfig.Token) {
	// Create client
	const mixpanel = Mixpanel.init(MixpanelConfig.Token, { 
		secret: MixpanelConfig.Secret,
		verbose: true 
	});

	module.exports.client = mixpanel;
}
else {
	module.exports.client = {
		track: () => {}
	};
}
