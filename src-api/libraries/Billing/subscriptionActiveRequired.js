module.exports = () => {
	return (req, _, next) => (async () => {
		if (req.project && new Date(req.project.subscription_current_period_end) < new Date()) {
			const error = new Error();
			error.statusCode = 400;
			error.message = `Your subscription is not active. Please go to https://app.buglesstack.com/billing to resolve it. ID ${req.project.id}`;
			error.avoidLogging = true;

			throw error;
		}

		next();
	})().catch(next);
};
