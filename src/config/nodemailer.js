const { getEnvPath } = require('../helpers');

require('dotenv').config({
  path: getEnvPath(),
});

module.exports = {
  service: 'gmail',
  auth: {
    user: process.env.MAILER_USER,
    pass: process.env.MAILER_PASSWORD,
  },
};
