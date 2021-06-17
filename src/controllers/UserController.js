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
        city,
        state,
      } = request.body;

      // Verify if e-mail is already registered
      const existsEmail = await connection('users')
        .select('id', 'email')
        .where('email', email)
        .first();

      if (existsEmail) {
        return response
          .status(400)
          .send({ message: 'E-mail is already being used.' });
      }

      // Hashing password
      const passwordHashed = await this.hashPassword(password);

      const user = await connection('users')
        .insert({
          first_name,
          last_name,
          email,
          password: passwordHashed,
          age,
          gender,
          city,
          state,
        })
        .returning(['*']);

      return response.status(201).send(user[0]);
    } catch (error) {
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async authenticate(request, response) {
    try {
      const { email, password } = request.body;

      const user = await connection('users')
        .select(['*'])
        .where('email', email)
        .first();

      // Never tell the user if the e-mail is incorrect or the password
      if (!user) {
        return response
          .status(404)
          .send({ message: 'E-mail or Password incorrect' });
      }

      // Authenticate user password
      const isValidPassword = await bcrypt.compare(password, user.password);

      // Never tell the user if the e-mail is incorrect or the password
      if (!isValidPassword) {
        return response
          .status(400)
          .send({ message: 'E-mail or Password incorrect' });
      }

      const token = await jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

      delete user.password;

      return response.status(200).send({ token, user });
    } catch (error) {
      console.log(error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async update(request, response) {
    try {
      const { first_name, last_name, age, gender, city, state } = request.body;

      const user = await connection('users')
        .select(['*'])
        .where('id', request.userId)
        .first();

      if (!user) {
        return response.status(404).send({ message: 'User not found' });
      }

      await connection('users')
        .update({
          first_name,
          last_name,
          age,
          gender,
          city,
          state,
        })
        .where('id', request.userId);

      return response
        .status(200)
        .send({ message: 'User successfully updated' });
    } catch (error) {
      console.log(error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async updatePassword(request, response) {
    try {
      const { password } = request.body;

      const user = await connection('users')
        .select(['*'])
        .where('id', request.userId)
        .first();

      if (!user) {
        return response.status(404).send({ message: 'User not found' });
      }

      const passwordHashed = await this.hashPassword(password);

      await connection('users')
        .update({
          password: passwordHashed,
        })
        .where('id', request.userId);

      return response
        .status(200)
        .send({ message: 'Password successfully updated' });
    } catch (error) {
      console.log(error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async updateEmail(request, response) {
    try {
      const { email } = request.body;

      const user = await connection('users')
        .select(['*'])
        .where('id', request.userId)
        .first();

      if (!user) {
        return response.status(404).send({ message: 'User not found' });
      }

      await connection('users')
        .update({
          email,
        })
        .where('id', request.userId);

      return response
        .status(200)
        .send({ message: 'Email successfully updated' });
    } catch (error) {
      console.log(error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async hashPassword(password) {
    return bcrypt.hash(password, 10);
  }
}

module.exports = new UserController();
