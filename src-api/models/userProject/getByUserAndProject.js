module.exports = async function getByUser (userId, projectId, options) {
	const query = this.query
		.where('user_id', '=', userId)
		.where('project_id', '=', projectId)
		.limit(1)
		.orderBy('created_at', 'desc');

	const { rows: [row] } = await query.get();

	return this.map(row, options);
};
