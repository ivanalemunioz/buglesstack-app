module.exports = async function getAll (limit, start, options) {
	const query = this.query
		.orderBy('created_at', 'desc')
		.limit(limit)
		.startAfter(start);

	const { rows } = await query.get();

	return this.map(rows, options);
};
