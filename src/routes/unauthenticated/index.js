const express = require('express');

const UserController = require('../../controllers/UserController');
const StateController = require('../../controllers/StateController');
const CityController = require('../../controllers/CityController');

const routes = express.Router();

routes.post('/register', (request, response) =>
  UserController.register(request, response)
);
routes.post('/authenticate', (request, response) =>
  UserController.authenticate(request, response)
);

routes.get('/state', (request, response) =>
  StateController.findAll(request, response)
);

routes.get('/city', (request, response) =>
  CityController.findAll(request, response)
);

module.exports = routes;
