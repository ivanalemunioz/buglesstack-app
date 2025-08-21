const { Pool } = require('pg');

const config = require('../../config/postgres');

// Create postgres pool
const postgresPool = new Pool(config);

module.exports.pool = postgresPool;
