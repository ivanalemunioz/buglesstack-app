module.exports = async function getByShareToken (shareToken, options) {
	const query = this.query
		.where('share_token', '=', shareToken)
		.limit(1);

	const { rows: [row] } = await query.get();

	return this.map(row, options);
};
