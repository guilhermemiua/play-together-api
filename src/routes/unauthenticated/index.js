const express = require('express');

const UserController = require('../../controllers/UserController');

const routes = express.Router();

routes.post('/register', (request, response) =>
  UserController.register(request, response)
);
routes.post('/authenticate', (request, response) =>
  UserController.authenticate(request, response)
);

module.exports = routes;
