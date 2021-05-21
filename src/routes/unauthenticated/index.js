const express = require('express');
const FileController = require('../../controllers/FileController');

const UserController = require('../../controllers/UserController');

const routes = express.Router();

routes.post('/register', (request, response) =>
  UserController.register(request, response)
);
routes.post('/authenticate', (request, response) =>
  UserController.authenticate(request, response)
);
routes.get('/file/:filename', (request, response) =>
  FileController.download(request, response)
);

module.exports = routes;
