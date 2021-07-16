const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { transaction } = require('objection');
const { User, FriendRequest, Friend } = require('../models');

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

  async removeMyFriend(request, response) {
    try {
      const { userId } = request;
      const { id } = request.params;

      const userFriend = await User.query().findById(id).omit('password');

      if (!userFriend) {
        return response.status(404).send({ message: 'User friend not found.' });
      }

      await User.relatedQuery('friends')
        .for(userId)
        .unrelate()
        .where('friend_id', id);

      await User.relatedQuery('friends')
        .for(id)
        .unrelate()
        .where('friend_id', userId);

      return response
        .status(200)
        .send({ message: 'Friend removed successfully!' });
    } catch (error) {
      console.log(error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async getFriendStatus(request, response) {
    try {
      const { userId } = request;
      const { id } = request.params;

      let status = {
        friends: false,
        sent_friend_request: false,
        received_friend_request: false,
      };

      const userFriend = await User.query().findById(id).omit('password');

      if (!userFriend) {
        return response.status(404).send({ message: 'User friend not found.' });
      }

      const sentFriendRequest = await FriendRequest.query()
        .where('sender_id', userId)
        .andWhere('receiver_id', id)
        .first();

      if (sentFriendRequest) {
        status = {
          ...status,
          sent_friend_request: true,
          friend_request: sentFriendRequest,
        };
      }

      const receivedFriendRequest = await FriendRequest.query()
        .where('sender_id', id)
        .andWhere('receiver_id', userId)
        .first();

      if (receivedFriendRequest) {
        status = {
          ...status,
          received_friend_request: true,
          friend_request: receivedFriendRequest,
        };
      }

      const friend = await Friend.query()
        .where('user_id', userId)
        .andWhere('friend_id', id)
        .first();

      if (friend) {
        status = {
          ...status,
          friends: true,
        };
      }

      return response.status(200).send(status);
    } catch (error) {
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async getMyFriends(request, response) {
    try {
      const { offset, limit } = request.query;
      const { userId } = request;

      const user = await User.query().findById(userId).omit('password');

      if (!user) {
        return response.status(404).send({ message: 'User not found.' });
      }

      const query = Friend.query()
        .where('user_id', userId)
        .withGraphFetched('[friend.[city, state], user.[city, state]]');

      if (offset && limit) {
        const friends = await query.page(
          parseInt(offset, 10),
          parseInt(limit, 10)
        );

        return response.status(200).send(friends);
      }

      const friends = await query;

      return response.status(200).send(friends);
    } catch (error) {
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async findAll(request, response) {
    try {
      const { offset, limit, name, notFriends } = request.query;
      const { userId } = request;

      const query = User.query().withGraphFetched('[city, state]');

      if (notFriends === '1') {
        query.where('id', '!=', userId);
        query.whereNotExists(
          User.relatedQuery('friends').alias('f').where('friend_id', userId)
        );
      }

      if (name) {
        query
          .where('first_name', 'like', `%${name}%`)
          .orWhere('last_name', 'like', `%${name}%`);
      }

      if (offset && limit) {
        const users = await query.page(
          parseInt(offset, 10),
          parseInt(limit, 10)
        );

        return response.status(200).send(users);
      }

      const users = await query;

      return response.status(200).send(users);
    } catch (error) {
      console.log(error);
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
      console.log(error);
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

  async sendFriendRequest(request, response) {
    try {
      const { receiver_id } = request.body;
      const { userId } = request;

      const user = await User.query().findById(userId);

      if (!user) {
        return response.status(404).send({ message: 'User not found' });
      }

      const userToSendFriendRequest = await User.query().findById(receiver_id);

      if (!userToSendFriendRequest) {
        return response
          .status(404)
          .send({ message: 'User to send friend request not found' });
      }
      const isFriends = await Friend.query().findOne({
        user_id: userId,
        friend_id: receiver_id,
      });

      if (isFriends) {
        return response.status(400).send({ message: "You're already friends" });
      }

      const existFriendRequest = await Friend.query().findOne({
        user_id: userId,
        friend_id: receiver_id,
      });

      if (existFriendRequest) {
        return response
          .status(400)
          .send({ message: 'Friend request already exists for this person' });
      }

      await User.relatedQuery('sent_friend_requests')
        .for(userId)
        .relate(receiver_id);

      return response.status(200).send({ message: 'Friend request sent' });
    } catch (error) {
      console.log(error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async acceptFriendRequest(request, response) {
    try {
      const { friend_request_id } = request.body;
      const { userId } = request;

      const friendRequest = await FriendRequest.query()
        .findById(friend_request_id)
        .where('receiver_id', userId);

      if (!friendRequest) {
        return response
          .status(404)
          .send({ message: 'Friend request not found.' });
      }

      await transaction(FriendRequest, User, async (FriendRequest, User) => {
        await User.relatedQuery('friends')
          .for(userId)
          .relate(friendRequest.sender_id);

        await User.relatedQuery('friends')
          .for(friendRequest.sender_id)
          .relate(userId);

        await FriendRequest.query().deleteById(friend_request_id);
      });

      return response.status(200).send({ message: 'Friend request accepted' });
    } catch (error) {
      console.log(error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async declineFriendRequest(request, response) {
    try {
      const { friend_request_id } = request.body;
      const { userId } = request;

      const friendRequest = await FriendRequest.query()
        .findById(friend_request_id)
        .where('receiver_id', userId);

      if (!friendRequest) {
        return response
          .status(404)
          .send({ message: 'Friend request not found.' });
      }

      await FriendRequest.query().deleteById(friend_request_id);

      return response.status(200).send({ message: 'Friend request declined' });
    } catch (error) {
      console.log(error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async cancelFriendRequest(request, response) {
    try {
      const { friend_request_id } = request.body;
      const { userId } = request;

      const friendRequest = await FriendRequest.query()
        .findById(friend_request_id)
        .where('sender_id', userId);

      if (!friendRequest) {
        return response
          .status(404)
          .send({ message: 'Friend request not found.' });
      }

      await FriendRequest.query().deleteById(friend_request_id);

      return response.status(200).send({ message: 'Friend request cancelled' });
    } catch (error) {
      console.log(error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async getSentFriendRequests(request, response) {
    try {
      const { offset, limit } = request.query;
      const { userId } = request;

      const user = await User.query().findById(userId);

      if (!user) {
        return response.status(404).send({ message: 'User not found' });
      }

      const query = FriendRequest.query()
        .where('sender_id', userId)
        .withGraphFetched('[sender, receiver]');

      if (offset && limit) {
        const sentFriendRequests = await query.page(
          parseInt(offset, 10),
          parseInt(limit, 10)
        );

        return response.status(200).send(sentFriendRequests);
      }

      const sentFriendRequests = await query;

      return response.status(200).send(sentFriendRequests);
    } catch (error) {
      console.log(error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async getReceivedFriendRequests(request, response) {
    try {
      const { offset, limit } = request.query;
      const { userId } = request;

      const user = await User.query().findById(userId);

      if (!user) {
        return response.status(404).send({ message: 'User not found' });
      }

      const query = FriendRequest.query()
        .where('receiver_id', userId)
        .withGraphFetched('[sender, receiver]');

      if (offset && limit) {
        const receivedFriendRequests = await query.page(
          parseInt(offset, 10),
          parseInt(limit, 10)
        );

        return response.status(200).send(receivedFriendRequests);
      }

      const sentFriendRequests = await query;

      return response.status(200).send(sentFriendRequests);
    } catch (error) {
      console.log(error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }
}

module.exports = new UserController();
