const path = require('path');

require('dotenv').config({
  path:
    process.env.NODE_ENV === 'test'
      ? path.join(__dirname, '../../.env.test')
      : path.join(__dirname, '../../.env'),
});

module.exports = {
  service: 'gmail',
  auth: {
    user: process.env.MAILER_USER,
    pass: process.env.MAILER_PASSWORD,
  },
};
