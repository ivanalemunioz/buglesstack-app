module.exports = async function getByRefreshToken (refreshToken, options) {
	const query = this.query
		.where('refresh_token', '=', refreshToken)
		.limit(1);

	const { docs } = await query.get();

	return docs.length > 0 ? this.map(docs[0], options) : null;
};
