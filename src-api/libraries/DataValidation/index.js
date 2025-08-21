const validators = require('./validators');
const lang = require('./lang_EN');

/**
 * Middleware for data validation    
 *
 * TODO: Allow to validate an array items or object properties 
 *
 * Example: 
 * rules = [{
 *  name : 'description',
 *  title : 'Descripcion',
 *  rules : ['required', { rule : 'max_length', value : 100 }]
 * }]
 **/
module.exports.validateData = (properties, options = {}) => {
	return (req, res, next) => {
		if (!(properties instanceof Array)) {
			next(); return;
		}

		const data = (req.method.toLowerCase() === 'get' ? req.query : req.body) || {};

		const errors = validateDataProperties(data, properties);

		if (errors === null) {
			next();
		}
		else if (options.return) {
			req.errors = errors;
			next();
		}
		else {
			const error = new Error();
			error.statusCode = 400;
			error.data_errors = errors;
			error.avoidLogging = true;

			next(error);
		}
	};
};

function validateDataProperties (data, properties) {
	const errors = {};

	// Iterate properties
	for (let i = 0; i < properties.length; i++) {
		const property = properties[i];

		/**
         * Instance is the property value in [data]
         **/
		let instance = data[property.name];
        
		// Trim instance if is posible
		if (instance && instance.trim) {
			instance = instance.trim();
		}

		// Validate instance
		const [isValid, error] = validateInstance(instance, property);

		if (!isValid) {
			errors[property.name] = error;
		}

		data[property.name] = instance;
	}

	return Object.keys(errors).length > 0 ? errors : null;
}

function validateInstance (instance, property) {
	let isValid = true; let error = null;
    
	property.rules = property.rules || [];

	error = getInstanceError(instance, property.rules, (property.title || property.name));
    
	if (error) {
		isValid = false;
	}

	// If is valid check the other property properties
	if (isValid && typeof instance !== 'undefined') {
		const isArray = property.rules.indexOf('array') !== -1;
        
		let errors = null;

		// Validate items if is array
		if (isArray && property.array_item_rules) {
			for (let i = 0; i < instance.length; i++) {
				const error = getInstanceError(instance[i], property.array_item_rules, `${(property.title || property.name)}[${i}]`);

				if (error) {
					if (!errors) {
						errors = {};
					}

					errors[i] = error; 
				}
			}
		}

		// Check property properties if it has
		if (!errors && property.properties) {
			if (isArray) {
				for (let i = 0; i < instance.length; i++) {
					const propertiesErrors = validateDataProperties(instance[i], property.properties);

					if (propertiesErrors) {
						if (!errors) {
							errors = {};
						}

						errors[i] = propertiesErrors; 
					}
				}
			}
			else {
				const propertiesErrors = validateDataProperties(instance, property.properties);

				if (propertiesErrors) {
					errors = propertiesErrors; 
				}
			}
		}
        
		if (errors) {
			isValid = false;
			error = errors;
		}
	}

	return [isValid, error];
}

function getInstanceError (instance, rules, propertyName) {
	// Iterate rules
	for (let j = 0; j < rules.length; j++) {
		let ruleName, ruleValue, errorMessage;

		if (typeof rules[j] === 'string') {
			ruleName = rules[j];
			ruleValue = '';
			errorMessage = lang['data_error_' + ruleName] || '';
		}
		else {
			ruleName = typeof rules[j].rule === 'undefined' ? '' : rules[j].rule;
			ruleValue = typeof rules[j].value === 'undefined' ? '' : rules[j].value;
			errorMessage = rules[j].message || lang['data_error_' + ruleName] || '';
		}

		// Set rule validator
		const validator = validators[ruleName];

		// Check that validator exists
		if (validator) {
			const isValid = validator(instance, ruleValue);

			// Check if is valid
			if (!isValid) {
				// Return error
				return parseErrorMessage(errorMessage, propertyName, ruleValue);
			}
		}
		else {
			return `The '${ruleName}' validator doesn't exist`;
		}
	}

	return null;
}

function parseErrorMessage (message, propertyName, ruleValue) {
	let res = message.replace('{{name}}', propertyName);

	if (typeof ruleValue !== 'undefined') { 
		res = res.replace('{{value}}', ruleValue);
	}

	return res;
}
