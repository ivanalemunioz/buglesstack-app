module.exports = async function getByProject (projectId, limit, start, options) {
	const query = this.query
		.where('project_id', '=', projectId)
		.orderBy('created_at', 'desc')
		.limit(limit)
		.startAfter(start);

	const { rows } = await query.get();

	return this.map(rows, options);
};
