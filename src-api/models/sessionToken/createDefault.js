const uid = require('rand-token').uid;

module.exports = async function createDefault (data) {
	// Set access token
	data.access_token = `APP-${uid(32)}-${data.user_id}`;

	// Set refresh token
	data.refresh_token = `RT-${uid(32)}`;
    
	// Set expiration (6 months)
	data.expires_at = new Date(Date.now() + 15552000000);

	data.updated_at = new Date();
	data.created_at = new Date();

	const documentRef = await this.create(data);

	return documentRef;
};
