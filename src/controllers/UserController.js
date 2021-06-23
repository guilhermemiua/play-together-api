const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { User } = require('../models');

class UserController {
  async me(request, response) {
    try {
      const { userId } = request;

      const user = await User.query()
        .findById(userId)
        .withGraphFetched('[city, state]')
        .omit('password');

      if (!user) {
        return response.status(404).send({ message: 'User not found.' });
      }

      return response.status(200).send(user);
    } catch (error) {
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async register(request, response) {
    try {
      const {
        first_name,
        last_name,
        email,
        password,
        age,
        gender,
        city_id,
        state_id,
      } = request.body;

      // Verify if e-mail is already registered
      const existsEmail = await User.query().findOne({
        email,
      });

      if (existsEmail) {
        return response
          .status(400)
          .send({ message: 'Email is already being used.' });
      }

      // Hashing password
      const passwordHashed = await this.hashPassword(password);

      const user = await User.query().insertAndFetch({
        first_name,
        last_name,
        email,
        password: passwordHashed,
        age,
        gender,
        city_id,
        state_id,
      });

      user.$omit('password');

      return response.status(201).send(user);
    } catch (error) {
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async authenticate(request, response) {
    try {
      const { email, password } = request.body;

      const user = await User.query().findOne({
        email,
      });

      // Never tell the user if the e-mail is incorrect or the password
      if (!user) {
        return response
          .status(404)
          .send({ message: 'Email or Password incorrect' });
      }

      // Authenticate user password
      const isValidPassword = await bcrypt.compare(password, user.password);

      // Never tell the user if the e-mail is incorrect or the password
      if (!isValidPassword) {
        return response
          .status(400)
          .send({ message: 'Email or Password incorrect' });
      }

      const token = await jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

      user.$omit('password');

      return response.status(200).send({ token, user });
    } catch (error) {
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async update(request, response) {
    try {
      const { first_name, last_name, age, gender, city_id, state_id } =
        request.body;
      const { file } = request;
      const profile_image = file ? file.filename : undefined;
      const { userId } = request;

      const user = await User.query().findById(userId);

      if (!user) {
        return response.status(404).send({ message: 'User not found' });
      }

      const updatedUser = await User.query().updateAndFetchById(userId, {
        first_name,
        last_name,
        age,
        gender,
        city_id,
        state_id,
        profile_image,
      });

      if (file && user.profile_image) {
        await fs.unlinkSync(
          path.join(__dirname, `../../uploads/${user.profile_image}`)
        );
      }

      return response.status(200).send(updatedUser[0]);
    } catch (error) {
      console.log(error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async updatePassword(request, response) {
    try {
      const { password } = request.body;
      const { userId } = request;

      const user = await User.query().findById(userId);

      if (!user) {
        return response.status(404).send({ message: 'User not found' });
      }

      const passwordHashed = await this.hashPassword(password);

      await User.query().findById(userId).update({
        password: passwordHashed,
      });

      return response
        .status(200)
        .send({ message: 'Password successfully updated' });
    } catch (error) {
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async updateEmail(request, response) {
    try {
      const { email } = request.body;
      const { userId } = request;

      const user = await User.query().findById(userId);

      if (!user) {
        return response.status(404).send({ message: 'User not found' });
      }

      if (user.email === email) {
        return response
          .status(400)
          .send({ message: 'Email cannot be equal to current email.' });
      }

      // Verify if e-mail is already registered
      const existsEmail = await User.query().findOne({
        email,
      });

      if (existsEmail) {
        return response
          .status(400)
          .send({ message: 'Email is already being used.' });
      }
      await User.query().findById(userId).update({
        email,
      });

      return response
        .status(200)
        .send({ message: 'Email successfully updated' });
    } catch (error) {
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async hashPassword(password) {
    return bcrypt.hash(password, 10);
  }
}

module.exports = new UserController();
