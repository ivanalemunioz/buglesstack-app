module.exports = async function getByMethodAndAddress (method, address, options) {
	const query = this.query
		.where('address', '=', address)
		.where('method', '=', method)
		.limit(1);

	const { docs } = await query.get();

	return docs.length > 0 ? this.map(docs[0], options) : null;
};
