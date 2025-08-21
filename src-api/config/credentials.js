/** 
 * Amazon SES
 **/
module.exports.AmazonSESConfig = {
	accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY,
	region: process.env.AWS_SES_REGION
};

/** 
 * AWS S3
 **/
module.exports.AWSS3Config = {
	accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
	region: process.env.AWS_S3_REGION
};

/**
 * Mixpanel
 **/
module.exports.MixpanelConfig = {
	Token: process.env.MIXPANEL_TOKEN,
	Secret: process.env.MIXPANEL_SECRET
};

/**
 * Stripe credentials
 **/
module.exports.StripeConfig = (process.env.ENV === 'production')
	? {
		SecretKey: process.env.STRIPE_LIVE_SECRET_KEY,
		WebHookSecretKey: process.env.STRIPE_LIVE_WEB_HOOK_SECRET_KEY
	}
	: {
		SecretKey: process.env.STRIPE_TEST_SECRET_KEY,
		WebHookSecretKey: process.env.STRIPE_TEST_WEB_HOOK_SECRET_KEY
	};
