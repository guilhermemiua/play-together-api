const path = require('path');

require('dotenv').config({
  path:
    process.env.NODE_ENV === 'test'
      ? path.join(__dirname, '../../.env.test')
      : path.join(__dirname, '../../.env'),
});

module.exports = {
  client: process.env.DB_CLIENT || 'pg',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: path.join(__dirname, '../database/migrations'),
  },
  seeds: {
    tableName: 'knex_seeds',
    directory: path.join(__dirname, '../database/seeds'),
  },
  timezone: 'UTC',
};
