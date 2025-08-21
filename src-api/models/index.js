const { resolve } = require('path');
const { readdirSync } = require('fs');

const BaseModel = require('../libraries/ModelCore/BaseModel');
const { modelsFields } = require('../libraries/ModelCore/utils');

const modelsModule = {};

/**
 * Load models
 **/
const models = readdirSync(__dirname, { 
	encoding: 'utf8', 
	withFileTypes: true
})
	.filter(directory => directory.isDirectory())
	.map(directory => ({ 
		directory: directory.name, 
		module: require(resolve(__dirname, directory.name)) 
	}))
	.filter(model => model.module instanceof BaseModel);

models.forEach(model => {
	// Add model to models module
	modelsModule[`${model.directory}Model`] = model.module;
    
	// Add models module as model parent
	model.module.parent = modelsModule;

	// Set default model fields in the model utils
	modelsFields[model.module.name] = model.module.fields;
});

/**
 * Return the model which tableName match the table argument
 *
 * @param {string} table Table of the reference
 **/
modelsModule.getByTableName = function (table) {
	const model = models.find(model => model.module.tableName === table);

	return model && model.module;
};

module.exports = modelsModule;
