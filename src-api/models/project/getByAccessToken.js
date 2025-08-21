module.exports = async function getByAccessToken (accessToken, options) {
	const query = this.query
		.where('access_token', '=', accessToken)
		.limit(1);

	const { rows: [row] } = await query.get();

	return this.map(row, options);
};
