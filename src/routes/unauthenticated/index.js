const express = require('express');

const validator = require('../../middlewares/validator');
const UserController = require('../../controllers/UserController');
const StateController = require('../../controllers/StateController');
const CityController = require('../../controllers/CityController');
const forgotPasswordSchema = require('../../validationSchemas/forgotPassword');
const forgotPasswordTokenSchema = require('../../validationSchemas/forgotPasswordToken');
const forgotPasswordNewPasswordSchema = require('../../validationSchemas/forgotPasswordNewPassword');

const routes = express.Router();

routes.post(
  '/forgot-password',
  validator(forgotPasswordSchema),
  (request, response) => UserController.forgotPassword(request, response)
);
routes.post(
  '/forgot-password/token',
  validator(forgotPasswordTokenSchema),
  (request, response) => UserController.forgotPasswordToken(request, response)
);
routes.post(
  '/forgot-password/new-password',
  validator(forgotPasswordNewPasswordSchema),
  (request, response) =>
    UserController.forgotPasswordNewPassword(request, response)
);
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
routes.get('/city/:id', (request, response) =>
  CityController.findById(request, response)
);

module.exports = routes;
