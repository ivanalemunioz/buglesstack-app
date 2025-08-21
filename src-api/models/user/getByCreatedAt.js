module.exports = async function getByCreatedAt (createdAtSince, createdAtUntil, limit, start, options) {
	const query = this.query
		.where('created_at', '>=', createdAtSince)
		.where('created_at', '<', createdAtUntil)
		.orderBy('created_at', 'desc')
		.limit(limit)
		.startAfter(start);

	const { rows } = await query.get();

	return this.map(rows, options);
};
