const express = require('express');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

const routes = express.Router();

module.exports = routes;
