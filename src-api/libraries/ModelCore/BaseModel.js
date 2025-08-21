const Postgres = require('../Postgres/index');

const baseUtils = require('./baseUtils');

class BaseModel {
	/**
     * Base model class with common methods
     *
     * @param {string} tableName Table name for the model
     * @param {function} mapFunction Function used to map results
     * @param {function} name Name of the model
     * @param {any} fields Default fields
     * */
	constructor (tableName, mapFunction, name, fields) {
		this.name = name;
		this.fields = fields;
		this.tableName = tableName;
        
		this.map = baseUtils.initializeMapFunction(mapFunction, this);
		this.getById = baseUtils.createMethod(this.getById, this);
        
		this.edit = this.edit.bind(this);
		this.create = this.create.bind(this);
		this.delete = this.delete.bind(this);
	}

	/**
     * Get by id
     *
     * @param id
     * */
	async getById (id, options) {
		const { rows } = await this.query
			.where('id', '=', id)
			.limit(1)
			.get();

		if (!rows.length) {
			return null;
		}

		return this.map(rows[0], options);
	}

	/**
     * Create one
     *
     * @param data
     * */
	async create (data) {
		// Replace firestore references in the data 
		const [dataToInsert, replacedReferences] = baseUtils.replaceReferences(data);

		const fields = Object.keys(dataToInsert);

		const query = `INSERT INTO ${this.tableName}(id,${fields.map(field => `"${field}"`).join(',')}) 
                        VALUES (uuid_generate_v4(),${fields.map((field, i) => `$${i + 1}`).join(',')}) 
                        RETURNING *`;

		const queryData = fields.map(field => dataToInsert[field]);

		const result = await Postgres.pool.query(query, queryData);

		// console.log('result.rows[0] before');
		// console.log(result.rows[0]);
		// console.log('replacedReferences');
		// console.log(replacedReferences);

		// Put references in the data again
		result.rows[0] = baseUtils.putReferences(result.rows[0], replacedReferences);
        
		// console.log('result.rows[0] after');
		// console.log(result.rows[0]);

		// console.log('data before');
		// console.log(data);
		// console.log('replacedReferences');
		// console.log(replacedReferences);

		// Put references in the original data to avoid problems
		baseUtils.putReferences(data, replacedReferences);

		// console.log('data after');
		// console.log(data);

		// await this.collection.doc(result.rows[0].id).set(result.rows[0]);

		return result.rows[0];
	}

	/**
     * Edit
     *
     * @param id Id to edit
     * @param data Data to edit
     * */
	async edit (id, data) {
		// Replace firestore references in the data 
		const [dataToInsert, replacedReferences] = baseUtils.replaceReferences(data);

		// console.log('dataToInsert');
		// console.log(dataToInsert);
		// console.log('replacedReferences');
		// console.log(replacedReferences);

		const fields = Object.keys(dataToInsert);

		const query = `UPDATE ${this.tableName} 
                        SET ${fields.map((field, i) => `"${field}"=$${i + 1}`).join(',')} 
                        WHERE id=$${fields.length + 1} 
                        RETURNING ${fields.indexOf('id' === -1) ? 'id,' : ''} ${fields.map((field) => `"${field}"`).join(',')} `;

		const queryData = fields.map(field => dataToInsert[field]);
        
		// Add id to query data
		queryData.push(id);

		// console.log(query, queryData);
        
		const result = await Postgres.pool.query(query, queryData);
        
		// Put references in the data again
		result.rows[0] = baseUtils.putReferences(result.rows[0], replacedReferences);
        
		// Put references in the original data to avoid problems
		baseUtils.putReferences(data, replacedReferences);

		// console.log('data');
		// console.log(data);

		// console.log('result.rows[0]');
		// console.log(result.rows[0]);

		// await this.collection.doc(id).update(result.rows[0]);

		return result.rows[0];
	}

	/**
     * Delete one
     *
     * @param id
     * */
	async delete (id) {
		const query = `DELETE FROM ${this.tableName} WHERE id=$1 RETURNING * `;

		const queryData = [id];

		const result = await Postgres.pool.query(query, queryData);

		// await this.collection.doc(id).delete();

		return result.rows[0] || null;
	}
}

module.exports = BaseModel;
