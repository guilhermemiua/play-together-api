const knex = require('knex');
const config = require('../config/knexfile');

const connection = knex(config);

module.exports = connection;
