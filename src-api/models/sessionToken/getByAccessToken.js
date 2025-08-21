module.exports = async function getByAccessToken (accessToken, options) {
	const query = this.query
		.where('access_token', '=', accessToken)
		.limit(1);

	const { docs } = await query.get();

	return docs.length > 0 ? this.map(docs[0], options) : null;
};
