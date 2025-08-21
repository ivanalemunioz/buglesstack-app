/**
 * Map document
 *
 * @param data Document data
 **/
module.exports = async function mapOne (data, options) {
	// Transform expires at to date
	if (data.expires_at !== null) {
		data.expires_at = new Date(data.expires_at);
	}

	return data;
}
;
