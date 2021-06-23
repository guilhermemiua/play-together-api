const knex = require('knex');
const config = require('../config/knexfile');

module.exports = knex(config);
