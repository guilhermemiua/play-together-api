const express = require('express');
const multer = require('multer');
const path = require('path');

const validator = require('../../middlewares/validator');

const EventController = require('../../controllers/EventController');
const UserController = require('../../controllers/UserController');
const createEventSchema = require('../../validationSchemas/createEvent');
const updateEventSchema = require('../../validationSchemas/updateEvent');
const updateEmailSchema = require('../../validationSchemas/updateEmail');
const updatePasswordSchema = require('../../validationSchemas/updatePassword');
const joinEventSchema = require('../../validationSchemas/joinEvent');
const disjoinEventSchema = require('../../validationSchemas/disjoinEvent');

const routes = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });
routes.get('/me', (request, response) => UserController.me(request, response));
routes.put('/me', upload.single('profile_image'), (request, response) =>
  UserController.update(request, response)
);
routes.put(
  '/me/update-email',
  validator(updateEmailSchema),
  (request, response) => UserController.updateEmail(request, response)
);
routes.put(
  '/me/update-password',
  validator(updatePasswordSchema),
  (request, response) => UserController.updatePassword(request, response)
);

routes.post('/event', validator(createEventSchema), (request, response) =>
  EventController.create(request, response)
);
routes.put('/event/:id', validator(updateEventSchema), (request, response) =>
  EventController.update(request, response)
);
routes.get('/event/:id', (request, response) =>
  EventController.findById(request, response)
);
routes.delete('/event/:id', (request, response) =>
  EventController.delete(request, response)
);
routes.get('/event', (request, response) =>
  EventController.findAll(request, response)
);
routes.post('/event/join', validator(joinEventSchema), (request, response) =>
  EventController.joinUser(request, response)
);
routes.post(
  '/event/disjoin',
  validator(disjoinEventSchema),
  (request, response) => EventController.disjoinUser(request, response)
);
routes.delete('/event/:event_id/user/:user_id', (request, response) =>
  EventController.removeUser(request, response)
);

module.exports = routes;
