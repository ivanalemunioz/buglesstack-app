module.exports = async function getByUser (userId, options) {
	const query = this.query
		.where('user_id', '=', userId)
		.orderBy('created_at', 'desc');

	const { rows } = await query.get();

	return this.map(rows, options);
};
