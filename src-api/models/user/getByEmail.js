module.exports = async function getByEmail (email, options) {
	const query = this.query.where('email', '=', email).limit(1);

	const { docs } = await query.get();

	return docs.length > 0 ? this.map(docs[0], options) : null;
};
