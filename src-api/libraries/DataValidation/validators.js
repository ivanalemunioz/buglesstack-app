/* eslint-disable no-useless-escape */
/* eslint-disable eqeqeq */
/* eslint-disable default-case */

/**
 * Validate that the value instance is set
 **/
module.exports.required = (instance) => {
	let res = false;
	switch (typeof instance) {
	case 'object': 
	case 'number':
	case 'boolean':
		res = true;
		break;
	case 'string':
		if (instance.trim() != '') {
			res = true;
		}
		break;
	}
	return res;
};

/**
 * Check the max length of the value instance
 **/
module.exports.max_length = (instance, value) => {
	let res = false;
	if (typeof instance === 'number') {
		instance = instance.toString();
	}

	if (typeof instance === 'undefined' || (typeof instance.length !== 'undefined' && instance.length <= value)) {
		res = true;
	}

	return res;
};

/**
 * Check the min length of the value instance
 **/
module.exports.min_length = (instance, value) => {
	let res = false;
	if (typeof instance === 'number') {
		instance = instance.toString();
	}

	if (typeof instance === 'undefined' || (typeof instance.length !== 'undefined' && instance.length >= value)) {
		res = true;
	}

	return res;
};

/**
 * Check that the value instance is an string
 **/
module.exports.string = (instance) => {
	return typeof instance === 'undefined' || typeof instance === 'string';
};

/**
 * Check that the value instance is one of the enumerated 
 **/
module.exports.enum = (instance, value) => {
	let res = false;
	if (typeof instance === 'undefined' || (value instanceof Array && value.indexOf(instance) != -1)) {
		res = true;
	}

	return res;
};

/**
 * Check that the value instance satisfy the regexp 
 **/
module.exports.regexp = (instance, value) => {
	let res = false;
	if (typeof instance === 'undefined' || (value instanceof RegExp && value.test(instance))) {
		res = true;
	}

	return res;
};

/**
 * Check that the value instance is a number
 **/
module.exports.number = (instance) => {
	if (typeof instance === 'undefined' || typeof instance === 'number') {
		return true;
	}
    
	if (typeof instance === 'string' && parseFloat(instance) == instance) {
		return true;
	}

	return false;
};

/**
 * Check that the value instance is a integer
 **/
module.exports.integer = (instance) => {
	if (typeof instance === 'undefined') {
		return true;
	}
    
	if ((typeof instance === 'number' || typeof instance === 'string') && 
        parseInt(instance) == instance) {
		return true;
	}

	return false;
};

/**
 * Validate that the value instance is an array
 **/
module.exports.array = (instance) => {
	return (typeof instance === 'undefined') || Array.isArray(instance);
};

/**
 * Validate that the value instance is an email
 **/
module.exports.email = (instance) => {
	const emailRegExp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    
	return (typeof instance === 'undefined') || (typeof instance === 'string' && emailRegExp.test(instance));
};

/**
 * Validate that the value instance is an ISO date
 **/
module.exports.ISOdate = (instance) => {
	const ISOdateRegExp = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;
    
	return (typeof instance === 'undefined') || (typeof instance === 'string' && ISOdateRegExp.test(instance));
};

/**
 * Validate that the [instance] is greater or equal than the [value]
 **/
module.exports.goe = (instance, value) => {
	return (typeof instance === 'undefined') || instance >= value;
};

/**
 * Validate that the [instance] is less or equal than the [value]
 **/
module.exports.loe = (instance, value) => {
	return (typeof instance === 'undefined') || instance <= value;
};

/**
 * Validate that the [instance] properties length is equal than the [value]
 **/
module.exports.properties_length = (instance, value) => {
	return (typeof instance === 'undefined') || Object.keys(instance).length === value;
};

/**
 * Validate that the [instance] properties length is less or equal than the [value]
 **/
module.exports.max_properties_length = (instance, value) => {
	return (typeof instance === 'undefined') || Object.keys(instance).length <= value;
};

/**
 * Validate that the [instance] starts with http(s)
 **/
module.exports.url = (instance) => {
	return (typeof instance === 'undefined') || (/^(http|https)/).test(instance);
};

/**
 * Check that the instance is alpha numeric
 **/
module.exports.alphanumeric = (instance) => {
	let res = false;
	if (typeof instance === 'undefined' || ((/^[a-zA-Z0-9]+$/i).test(instance))) {
		res = true;
	}

	return res;
};

/**
 * Check that the value is an object
 **/
module.exports.object = (instance) => {
	return typeof instance === 'undefined' || (typeof instance === 'object' && !Array.isArray(instance));
};

/** ---------------- CUSTOM RULES ---------------- **/

/**
 * Validate that the value instance is an array of integers
 **/
module.exports.array_of_integers = (instance) => {
	return (typeof instance === 'undefined') || 
    (
    	Array.isArray(instance) &&
        instance.reduce((prev, actual) => {
        	return prev && typeof actual === 'number' && parseInt(actual) == actual;
        }, true)
    );
};

/**
 * Validate that the value instance is an integers or an array of integers
 **/
module.exports.integer_or_array_of_integers = (instance) => {
	return (typeof instance === 'undefined') || 
    module.exports.integer(instance) ||
    module.exports.array_of_integers(instance);
};
