const path = require('path');

const getEnvPath = () => {
  if (process.env.NODE_ENV === 'test') {
    return path.join(__dirname, '../../.env.test');
  }
  if (process.env.NODE_ENV === 'production') {
    return path.join(__dirname, '../../.env');
  }
  if (process.env.NODE_ENV === 'development') {
    return path.join(__dirname, '../../.env.development');
  }
};

module.exports = {
  getEnvPath,
};
