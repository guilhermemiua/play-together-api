const path = require('path');
const { getEnvPath } = require('../helpers');

require('dotenv').config({
  path: getEnvPath(),
});

let knexConfig = {
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

if (process.env.NODE_ENV === 'production') {
  knexConfig = {
    ...knexConfig,
    connection: {
      ...knexConfig.connection,
      ssl: {
        rejectUnauthorized: false,
      },
    },
  };
}

module.exports = knexConfig;
