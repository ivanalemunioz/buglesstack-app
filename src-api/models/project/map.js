module.exports = async function mapOne (data, options) {
	// Enforce bigints to be numbers
	if (typeof data.current_period_crashes_usage !== 'undefined') {
		data.current_period_crashes_usage = Number(data.current_period_crashes_usage);
	}

	if (typeof data.crashes_limit !== 'undefined') {
		data.crashes_limit = Number(data.crashes_limit);
	}

	return data;
};
