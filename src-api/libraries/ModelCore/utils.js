/**
 * The model fields are setted by the models module 
 * */
module.exports.modelsFields = {};

/**
  * Get default model fields for a role with the posibility of
  * include others or exclude some of the fields
  *
  * Available field tags:
  *
  * DEEP: When should remove the sub fields of the field
  *
  * @param {string} model Model for the fields
  * @param {string} role User role or "__DEFAULT__"
  * @param {string|string[]} include An array of field to include
  * @param {string|string[]} exclude An array of field to exclude
  * */
module.exports.getFields = (model, role, include = undefined, exclude = undefined) => {
	// slice() is used to create a copy and avoid mute the original fields
	let fields = module.exports.modelsFields[model][role || '__DEFAULT__'].slice();

	// Add the field/s in [include]
	if (Array.isArray(include)) {
		fields.push(...include);
	}
	else if (typeof include === 'string') {
		fields.push(include);
	}
 
	// Create the fields
	fields = module.exports.createFields(fields);
 
	// Remove the field/s in [exclude]
	if (Array.isArray(exclude) || (typeof exclude === 'string' && (exclude = [exclude]))) {
		// Fields to remove deeply (all subfields)
		const deepExclude = [];
 
		// Parse DEEP fields
		exclude = exclude.map(field => {
			if ((/^DEEP\./).test(field)) {
				const deep = field.substring(('DEEP.').length); 

				// Add to deep exclude
				deepExclude.push(deep);
 
				// Keep the field in the [exclude] array to allow
				// remove them bellow
				return deep;
			}
 
			return field;
		});
 
		// Remove fields
		for (let i = fields.length - 1; i >= 0; i--) {
			if (exclude.indexOf(fields[i]) !== -1 || 
                !!deepExclude.find(exclude => (new RegExp(`${exclude}\\.`)).test(fields[i]))) {
				// Remove from references if is there
				delete fields.references[fields[i]];
 
				// Remove field
				fields.splice(i, 1);
			}
		}
	}
 
	return fields;
};
 
/**
  * Create a fields object for the model (for now there
  * is an array) from an array of fields
  *
  * Available field tags:
  *
  * MAPONLY: When the field is available only for the map function, then is removed
  * REFERENCE: When the field is a reference to another document
  * MAPFIELD: When the field is created by the map function
  * TABLE: Set the name of the table name where is the reference
  * FIELD: Set the name of the reference field name 
  *
  * @param {string[]} fields Array of fields
  * @param {string | undefined} entity Name of the entity
  * */
module.exports.createFields = (fields, entity) => {
	// Copy fields param to avoid modify the original
	fields = [...fields];
 
	// Separate the fields that should be removed after map
	fields.mapOnly = [];
 
	const mapOnlyRegExp = /^MAPONLY\./;
	const mapOnlyPath = 'MAPONLY.';
 
	for (let i = 0; i < fields.length; i++) {
		if (mapOnlyRegExp.test(fields[i])) {
			const field = fields[i].substring(mapOnlyPath.length); 
            
			// Add the field
			fields.mapOnly.push(field);
            
			// Keep the reference in the [fields] array to allow
			// get this in the query
			fields[i] = field;
		}
	}
 
	// Separate the references
	fields.references = {};
 
	const references = [];
 
	for (let i = 0; i < fields.length; i++) {
		if ((/^REFERENCE\./).test(fields[i])) {
			const reference = fields[i].substring(('REFERENCE.').length); 
            
			// Add the reference
			references.push(reference);

			// Remove reference field
			fields.splice(i, 1);
		}
	}
 
	fields.references = {};
 
	// Add fields to references
	for (let i = 0; i < references.length; i++) {
		const referenceRegExp = new RegExp(`^${references[i]}\\.`);
		const referencePath = `${references[i]}.`;
 
		fields.references[references[i]] = [];
 
		// Create a reverse loop to allow remove fields
		for (let j = fields.length - 1; j >= 0; j--) {
			if (referenceRegExp.test(fields[j])) {
				// Add field to reference fields
				fields.references[references[i]].push(fields[j].substring(referencePath.length));
 
				// Remove field
				fields.splice(j, 1);
			}
			// Remove field if is same as the reference
			else if (fields[j] === references[i]) {
				fields.splice(j, 1);
			}
		}
 
		// Create reference fields 
		fields.references[references[i]] = module.exports.createFields(fields.references[references[i]], references[i]);

		// Add the reference field to [fields] array to allow
		// get this in the query
		if (references[i].split('.').length === 1) {
			fields.push(fields.references[references[i]].field);
		}
		else {
			fields.push(references[i]);
		}
	}
 
	// Separate the fields for map
	fields.mapFields = [];
 
	const mapFieldRegExp = /^MAPFIELD\./;
	const mapFieldPath = 'MAPFIELD.';
 
	// Create a reverse loop to allow remove fields
	for (let i = fields.length - 1; i >= 0; i--) {
		if (mapFieldRegExp.test(fields[i])) {
			// Add field to map fields
			fields.mapFields.push(fields[i].substring(mapFieldPath.length));
 
			// Remove field
			fields.splice(i, 1);
		}
	}
    
	// Check if there is a field for table name
	fields.table = undefined;
 
	const tableRegExp = /^TABLE\./;
	const tablePath = 'TABLE.';
 
	// Create a reverse loop to allow remove fields
	for (let i = fields.length - 1; i >= 0; i--) {
		if (tableRegExp.test(fields[i])) {
			// Set table name
			fields.table = fields[i].substring(tablePath.length);
 
			// Remove field
			fields.splice(i, 1);
 
			break;
		}
	}
 
	if (typeof fields.table === 'undefined' && entity) {
		fields.table = `${entity.split('.').pop()}s`;
	}
    
	// Check if there is a field name for reference
	fields.field = undefined;
 
	const fieldRegExp = /^FIELD\./;
	const fieldPath = 'FIELD.';
 
	// Create a reverse loop to allow remove fields
	for (let i = fields.length - 1; i >= 0; i--) {
		if (fieldRegExp.test(fields[i])) {
			// Set field name
			fields.field = fields[i].substring(fieldPath.length);
 
			// Remove field
			fields.splice(i, 1);
 
			break;
		}
	}
 
	if (typeof fields.field === 'undefined' && entity) {
		fields.field = `${entity.split('.').pop()}_id`;
	}

	// Separate json fields
	fields.json = {};
    
	// Filter json fields
	for (let i = fields.length - 1; i >= 0; i--) {
		const jsonFieldRegExp = new RegExp(`^${fields[i]}\\.`);
		const jsonFieldPath = `${fields[i]}.`;
 
		fields.json[fields[i]] = [];
 
		// Create a reverse loop to allow remove fields
		for (let j = fields.length - 1; j >= 0; j--) {
			if (jsonFieldRegExp.test(fields[j])) {
				// Add field to json fields
				fields.json[fields[i]].push(fields[j].substring(jsonFieldPath.length));
 
				// Remove field
				fields.splice(j, 1);
			}
		}

		// Create json fields 
		if (fields.json[fields[i]].length) {
			fields.json[fields[i]] = module.exports.createFields(fields.json[fields[i]]);
		}
		else {
			delete fields.json[fields[i]];
		}
	}

	return fields;
};
