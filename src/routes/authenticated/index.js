const express = require('express');

const validator = require('../../middlewares/validator');

const EventController = require('../../controllers/EventController');
const UserController = require('../../controllers/UserController');

const createEventSchema = require('../../validationSchemas/createEvent');
const updateEmailSchema = require('../../validationSchemas/updateEmail');
const updatePasswordSchema = require('../../validationSchemas/updatePassword');

const routes = express.Router();

routes.put('/user', (request, response) =>
  UserController.update(request, response)
);
routes.put('/update-email', validator(updateEmailSchema), (request, response) =>
  UserController.updateEmail(request, response)
);
routes.put(
  '/update-password',
  validator(updatePasswordSchema),
  (request, response) => UserController.updatePassword(request, response)
);

routes.post('/event', validator(createEventSchema), (request, response) =>
  EventController.create(request, response)
);
routes.get('/event/:id', (request, response) =>
  EventController.findById(request, response)
);
routes.get('/event', (request, response) =>
  EventController.findAll(request, response)
);

module.exports = routes;
