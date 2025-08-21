/* eslint-disable indent */
const Postgres = require('../Postgres/index');

const { createFields } = require('./utils');

class Query {
    constructor (tableName, fields) {
        this.wheres = [];
        this.orders = [];
        this.start = undefined;
        this.rowsLimit = 0;

        this.fields = fields;
        this.tableName = tableName;
    }

    select (fields) {
        this.fields = fields;
        
        return this;
    }

    where (field, condition, value) {
        this.wheres.push([{ field, condition, value }]);

        return this;
    }

    whereOR (...wheres) {
        this.wheres.push(wheres.map(([field, condition, value]) => ({ field, condition, value })));
        
        return this;
    }

    limit (rowsLimit) {
        this.rowsLimit = rowsLimit;
    
        return this;
    }

    orderBy (field, order = 'asc', nulls = 'last', notRepeatable = true) {
        this.orders.push({ field, order: order.toLocaleLowerCase(), nulls, notRepeatable });
        
        return this;
    }

    startAfter (id) {
        // Check if is set and is an string
        if (!id || typeof id !== 'string') {
            return this;
        }

        this.start = id;
        
        return this;
    }

    async get () {
        // Prepare query data
        const queryData = [];

        // Create query 
        let query = `SELECT ${this.fields.map(field => `"${field}"`).join(',')} FROM ${this.tableName} `;

        // // Add join
        // if (Object.keys(this.fields.references).length > 0) {
        //     query += `${Object.keys(this.fields.references).map(entity => `JOIN (SELECT ('{${this.fields.references[entity].map(field => `"${field}":'||COALESCE(to_json("${field}"), 'null')||'`).join(',')}}')::jsonb AS ${entity} FROM ${this.fields.references[entity].table}) ${entity}_${this.fields.references[entity].table} ON ${this.tableName}."${this.fields.references[entity].field}" = (${`${entity}_${this.fields.references[entity].table}."${entity}"->>'id'`})::text `).join(' ')}`;
        // }

        // Add where
        if (this.wheres.length > 0) {
            query += `WHERE ${this.wheres.map(wheres => 
                `(${wheres.map(where => 
                    `${where.field.indexOf('->') === -1 ? `"${where.field}"` : where.field} ${where.condition} ${where.condition === 'in' || where.condition === '@>' ? `(${where.condition === '@>' ? 'ARRAY[' : ''}${where.value.map(value => `$${queryData.push(value)}`).join(',')}${where.condition === '@>' ? ']' : ''})` : `$${queryData.push(where.value)}`}`
                ).join(' OR ')})`
            ).join(' AND ')} `;
        }

        // Add order by id if orders array is empty
        if (this.orders.filter(({ notRepeatable }) => notRepeatable).length === 0) {
            this.orders.push({ field: 'id', order: 'asc', nulls: 'last', notRepeatable: true });
        }
        
        // Add start
        if (typeof this.start !== 'undefined') {
            query += this.wheres.length > 0 ? ' AND ' : 'WHERE ';

            if (this.orders.filter(({ notRepeatable }) => !notRepeatable).length > 0) {
                query += ` (
                    ${this.orders.filter(({ notRepeatable }) => !notRepeatable).map(order => `(
                            "${order.field}" ${order.order === 'asc' ? '>' : '<'} (SELECT "${order.field}" FROM ${this.tableName} WHERE "id" = $${queryData.push(this.start)} LIMIT 1)
                            OR
                            (
                                "${order.field}" = (SELECT "${order.field}" FROM ${this.tableName} WHERE "id" = $${queryData.push(this.start)} LIMIT 1)
                                AND
                                ${this.orders.filter(({ notRepeatable }) => notRepeatable).map(order => `"${order.field}" ${order.order === 'asc' ? '>' : '<'} (SELECT "${order.field}" FROM ${this.tableName} WHERE "id" = $${queryData.push(this.start)} LIMIT 1) `).join(' AND ')}
                            )
                    )`).join(' AND ')}) `;
            }
 else {
                query += ` ${this.orders.map(order => `"${order.field}" ${order.order === 'asc' ? '>' : '<'} (SELECT "${order.field}" FROM ${this.tableName} WHERE "id" = $${queryData.push(this.start)} LIMIT 1) `).join(' AND ')} `;
            }
        }

        // Add order by
        if (this.orders.length > 0) {
            query += `ORDER BY ${this.orders.map(order => `"${order.field}" ${order.order} NULLS ${order.nulls}`).join(',')} `;
        }

        // Add limit
        if (this.rowsLimit > 0) {
            query += `LIMIT ${this.rowsLimit} `;
        }
        
        // console.log('this.fields');
        // console.log(this.fields);
        // console.log(query);
        // console.log(queryData);

        const result = await Postgres.pool.query(query, queryData);
        
        // console.log('result');
        // console.log(result);
        
        // Add [size] and [docs] to get compatibility with firestore
        result.size = result.rowCount;
        result.docs = result.rows;

        return result; 
    }
}

/**
 * Create a method for a model
 *
 * For now used to add the property query to the method
 *
 * @param {function} method Method function
 * @param {any} model Object to bind to the method
 * */
module.exports.createMethod = (method, model) => {
    return (...restArgs) => {
        // The options allways should be the last argument
        let options = restArgs[restArgs.length - 1];

        // True if the method was called with options
        const hasOptions = options && typeof options.select !== 'undefined';

        if (!hasOptions) {
            options = {};
        }

        if (!hasOptions || options.select === 'default') {
            options.select = createFields(model.fields.__DEFAULT__);
        }

        // Apply the selected fields
        const query = new Query(model.tableName, options.select);

        const args = Array.from(restArgs);

        if (!hasOptions) {
            args.push(options);
        }

        // Call the original method
        return method.apply({ ...model, query }, args);
    };
};

/**
 * @param {function} mapFunction Function to map the document/s
 * */
module.exports.initializeMapFunction = (mapFunction, model) => {
    /**
     * Function to map one or more documents
     *
     * @param {[any] | any} documents Document/s to map
     * */
    return async function map (docs, options) {
        if (!docs) {
            return null;
        }
        
        let documents = docs;
        
        const isArray = Array.isArray(documents);

        if (!isArray) {
            documents = [documents];
        }
 else if (documents.length === 0) {
            return documents;
        }

        documents = await addReferences(documents, options, model.parent);

        // Map documents
        const mapped = [];

        for (let i = 0; i < documents.length; i += 1) {
            let documentData = await mapFunction.bind(model)(documents[i], options);
            
            documentData = afterMap(documentData, options);

            mapped.push(documentData);
        }

        return isArray ? mapped : mapped[0];
    };
};

/**
 * Add references to the documents
 * 
 * @param {any[]} documents Documents
 * @param {{select: string[]}} options Model options
 * @param {any} modelsModule Models module
 * @returns {any[]} Documents with references
 */
async function addReferences (documents, options, modelsModule) {
    // console.log('addReferences');
    // console.log(documents);
    // console.log('options.select');
    // console.log(options.select);

    // Get references keys
    const selectReferences = Object.keys(options.select.references);
    // Check if has references
    if (selectReferences.length) {        
        const queries = [];
        const queryData = [];

        for (let i = 0; i < selectReferences.length; i++) {
            const referenceField = selectReferences[i];
            const referenceSelect = options.select.references[referenceField];

            let referencesQuery = `
            SELECT 
                row_to_json("${referenceField}_${referenceSelect.table}") as data, 
                '${referenceSelect.table}' as table, 
                '${referenceField}' as reference_field, 
                id 
            FROM (
                SELECT 
                    ${referenceSelect.map(field => `"${field}"`).join(',')}
                    ${referenceSelect.indexOf('id') === -1 ? ',id' : ''} 
                FROM ${referenceSelect.table}
            ) "${referenceField}_${referenceSelect.table}"
        `;

            // Start ids accumulator
            let ids = [];

            for (let j = 0; j < documents.length; j++) {
                const document = documents[j];

                // Get keys from the field path
                const keys = referenceField.split('.');

                // Add field as last key
                keys.splice(keys.length - 1, 1, referenceSelect.field.split('.').pop());

                // Add ids to accumulator reducing the path
                keys.reduce(pathReducer, { parent: document, ids });
            }

            // Check if has any value to query
            if (ids.length > 0) {
                // Use a new Set to remove the duplicate values
                ids = [...new Set(ids)];
                
                // console.log('------------');
                // console.log('ids');
                // console.log(ids);
                
                referencesQuery += `
                WHERE id in (${ids.map(id => `$${queryData.push(id)}`).join(',')})
                `;
                
                queries.push(referencesQuery);
            }
        }
    
        // Create final query
        const query = queries.join(' UNION ALL ');

        // console.log('query');
        // console.log(query);
        // console.log('data');
        // console.log(queryData);

        // Execute query
        const { rows: references } = await Postgres.pool.query(query, queryData);

        // console.log('references');
        // console.log(references);
    
        // Final references data already maped
        const referencesData = {};

        // Map references
        for (let i = 0; i < references.length; i++) {
            const model = modelsModule.getByTableName(references[i].table);
    
            const modelOptions = { 
                ...options, 
                select: options.select.references[references[i].reference_field]
            };

            referencesData[`${references[i].reference_field}/${references[i].id}`] = await model.map(references[i].data, modelOptions);
        }

        // console.log('referencesData');
        // console.log(referencesData);

        // Add references to documents
        for (let i = 0; i < selectReferences.length; i++) {
            const referenceField = selectReferences[i];
            const referenceSelect = options.select.references[referenceField];

            for (let j = 0; j < documents.length; j++) {
                const document = documents[j];

                // Get keys from the field path
                const keys = referenceField.split('.');

                // Add references reducing the path
                keys.reduce(pathReducer, { parent: document, referencesData, referenceSelect, referenceField });
            }

        // console.log('------------');
        // console.log('ids');
        // console.log(ids);
        }
    }

    for (let i = 0; i < documents.length; i++) {
        const document = documents[i];
        
        // Parse coordinates point(x,y)
        if (document.coordinates) {
            if (typeof document.coordinates === 'string') {
                const coordinates = document.coordinates.substr(1, document.coordinates.length - 2).split(',').map(val => parseFloat(val));

                document.coordinates = { 
                    lat: coordinates[1], 
                    lng: coordinates[0] 
                };
            }
 else {
                document.coordinates = { 
                    lat: document.coordinates.y, 
                    lng: document.coordinates.x 
                };
            }
        } 
        
        // Parse created_at when is a string
        if (document.created_at && typeof document.created_at === 'string') {
            document.created_at = new Date(document.created_at);
        } 
        
        // Parse updated_at when is a string
        if (document.updated_at && typeof document.updated_at === 'string') {
            document.updated_at = new Date(document.updated_at);
        }
    }

    // console.log('documents');
    // console.log(documents);
    
    return documents;
}

/**
 * Function used to get te references ids or put the
 * references in the document reducing the path 
 * 
 * @param {{ parent: any, ids: string[], referencesData: any, referenceSelect: any, referenceField: string }} Accumulator 
 * @param {string} key Key
 * @param {number} k Actual key index
 * @param {string[]} keys Field path keys
 * @returns 
 */
function pathReducer ({ parent, ids, referencesData, referenceSelect, referenceField }, key, k, keys) {
    // Check if parent is null to stop reduction if is an array
    if (parent === null) {
        return { parent: null, ids, referencesData, referenceSelect, referenceField };    
    }

    const fieldValue = parent[key];

    if (Array.isArray(fieldValue)) {
        fieldValue.forEach((fieldValue, l, array) => {
            // For array of ids
            if (typeof fieldValue === 'string') {
                // Add corresponding reference
                if (referencesData && referenceSelect) {
                    array[l] = referencesData[`${referenceField}/${fieldValue}`];
                }
                // Push id
                else {
                    ids.push(fieldValue);
                }
            }
            // For array of objects
            else {
                keys.slice(k + 1).reduce(pathReducer, { parent: fieldValue, ids, referencesData, referenceSelect, referenceField });
            }
        });

        // Set parent as null to stop reduction if is an array
        return { parent: null, ids, referencesData, referenceSelect, referenceField };    
    }
    // Add the id if is the last key
    else if (k === keys.length - 1) {
        // Add corresponding reference
        if (referencesData && referenceSelect) {
            parent[key] = referencesData[`${referenceField}/${parent[referenceSelect.field.split('.').pop()]}`];

            // Delete temporal id field
            delete parent[referenceSelect.field.split('.').pop()];
        }
        // Push id
        else {
            ids.push(fieldValue);
        }
    }
 else {
        return { parent: fieldValue, ids, referencesData, referenceSelect, referenceField };
    }
    
    return { parent, ids, referencesData, referenceSelect, referenceField };
}

/**
 * Function to apply to documents after map them
 * 
 * Here is where the final data properties are maped. 
 * Doesn't make a deep check of the Objects
 * 
 * @param {any} data Document data to map
 * @param {any} options Method call options
 * 
 * @return {any}
 * */
function afterMap (data, { select }) {
    // console.log(data);

    const selectedData = {};

    const allFields = select
        .concat(select.mapFields)
        .concat(Object.keys(select.references))
        .concat(Object.keys(select.json));

    for (let i = 0; i < allFields.length; i += 1) {
        // Filter fiels used only for map function 
        if (select.mapOnly.indexOf(allFields[i]) === -1) {
            // const initialFieldPath = allFields[i].split('.');
            if (allFields[i].split('.').length === 1 &&
                typeof data[allFields[i]] !== 'undefined' && 
                data[allFields[i]] !== null && 
                typeof selectedData[allFields[i]] === 'undefined') {
                // Filter object data if is in json 
                if (select.json[allFields[i]]) {
                    // Map array values
                    if (Array.isArray(data[allFields[i]])) {
                        selectedData[allFields[i]] = data[allFields[i]].map(arrayval => afterMap(arrayval, { select: select.json[allFields[i]] }));
                    }
                    // Map value
                    else {
                        selectedData[allFields[i]] = afterMap(data[allFields[i]], { select: select.json[allFields[i]] });
                    }
                }
 else {
                    selectedData[allFields[i]] = data[allFields[i]];
                }
            }
        }
    }

    return selectedData;
}

function replaceFirebaseFunctions (obj, stack = new Set()) {
    stack.add(obj);
  
    Object.keys(obj).forEach((key) => {
        if (
            obj[key] &&
            typeof obj[key] === 'object' &&
            !stack.has(obj[key])
        ) {
            replaceFirebaseFunctions(obj[key], stack);
        }
    });

    return obj;
};

function replaceDephReferences (obj, replacedReferences, path = [], stack = new Set()) {
    stack.add(obj);
  
    Object.keys(obj).forEach((key) => {
        if (
            obj[key] &&
            typeof obj[key] === 'object' &&
            !stack.has(obj[key])
        ) {
            replaceDephReferences(obj[key], replacedReferences, [...path, key], stack);
        }
    });

    return obj;
};

module.exports.replaceReferences = (data) => {
    let dataToInsert = data;
    const replacedReferences = [];
    
    dataToInsert = replaceFirebaseFunctions(dataToInsert);
    dataToInsert = replaceDephReferences(dataToInsert, replacedReferences);
        
    return [dataToInsert, replacedReferences];
};

module.exports.putReferences = (data, replacedReferences) => {
    const dataToInsert = data;

    // Put Firestore references again
    for (let i = 0; i < replacedReferences.length; i += 1) {
        const tempPath = replacedReferences[i].oldPath.slice();

        const key = tempPath.splice(tempPath.length - 1, 1)[0];
        const parent = tempPath.reduce((parent, key) => parent[`${key}`], dataToInsert);
        
        parent[`${key}`] = replacedReferences[i].originalValue;

        // Delete the new path if exists
        if (replacedReferences[i].newPath) {
            const tempPath = replacedReferences[i].newPath.slice();
            const key = tempPath.splice(tempPath.length - 1, 1)[0];
            const parent = tempPath.reduce((parent, key) => parent[`${key}`], dataToInsert);
    
            delete parent[`${key}`];
        }
    }

    return dataToInsert;
};
