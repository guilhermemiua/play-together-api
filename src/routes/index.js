const express = require('express')

const UserController = require('../controllers/UserController')
const auth = require('../middlewares/auth')

const routes = express.Router()

routes.post('/register', function (request, response) {
  return UserController.register(request, response)
})

routes.post('/authenticate', function (request, response) {
  return UserController.authenticate(request, response)
})

routes.post('/forgot-password', function (request, response) {
  return UserController.forgotPassword(request, response)
})

// Protected Routes
routes.use(auth)

module.exports = routes