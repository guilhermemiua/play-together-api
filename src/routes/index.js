const express = require('express');

const UserController = require('../controllers/UserController');
const auth = require('../middlewares/auth');

const routes = express.Router();

routes.post('/register', (request, response) =>
  UserController.register(request, response)
);

routes.post('/authenticate', (request, response) =>
  UserController.authenticate(request, response)
);

routes.post('/forgot-password', (request, response) =>
  UserController.forgotPassword(request, response)
);

// Protected Routes
routes.use(auth);

module.exports = routes;
