const path = require('path');
const jwt = require('jsonwebtoken');

require('dotenv').config({
  path:
    process.env.NODE_ENV === 'test'
      ? path.join(__dirname, '../../../.env.test')
      : path.join(__dirname, '../../../.env'),
});

async function auth(request, response, next) {
  try {
    const authorization = request.header('Authorization');

    const [, token] = authorization.split(' ');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    request.userId = decoded.userId;

    return next();
  } catch (error) {
    return response.status(403).send({ message: 'Forbidden' });
  }
}

module.exports = auth;
