const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const connection = require('../database/connection');

class UserController {
  async register(request, response) {
    try {
      const {
        first_name,
        last_name,
        email,
        password,
        age,
        gender,
        is_email_verified,
      } = request.body;

      // Verify if e-mail is already registered
      const existsEmail = await connection
        .select('id', 'email')
        .where('email', email)
        .from('users')
        .first();

      if (existsEmail) {
        return response
          .status(400)
          .send({ message: 'E-mail is already being used.' });
      }

      // Hashing password
      const hashPassword = await bcrypt.hash(password, 10);

      const user = await connection
        .returning([
          'id',
          'first_name',
          'last_name',
          'email',
          'age',
          'gender',
          'is_email_verified',
        ])
        .insert({
          first_name,
          last_name,
          email,
          password: hashPassword,
          age,
          gender,
          is_email_verified,
        })
        .into('users');

      return response.status(201).send(user[0]);
    } catch (error) {
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async authenticate(request, response) {
    try {
      const { email, password } = request.body;

      const user = await connection
        .select([
          'id',
          'first_name',
          'last_name',
          'password',
          'email',
          'age',
          'gender',
          'is_email_verified',
        ])
        .where('email', email)
        .from('users')
        .first();

      // Never tell the user if the e-mail is incorrect or the password
      if (!user) {
        return response
          .status(404)
          .send({ message: 'E-mail or Password incorrect.' });
      }

      // Authenticate user password
      const isValidPassword = await bcrypt.compare(password, user.password);

      // Never tell the user if the e-mail is incorrect or the password
      if (!isValidPassword) {
        return response
          .status(400)
          .send({ message: 'E-mail or Password incorrect.' });
      }

      const token = await jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

      delete user.password;

      return response.status(201).send({ token, user });
    } catch (error) {
      return response.status(500).send({ message: 'Internal server error' });
    }
  }
}

module.exports = new UserController();
