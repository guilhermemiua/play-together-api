const fs = require('fs');
const path = require('path');
const { Group, User } = require('../models');

class GroupController {
  async findById(request, response) {
    try {
      const { id } = request.params;

      const group = await Group.query()
        .findById(id)
        .withGraphFetched('[user.[city, state], users.[city, state]]');

      if (!group) {
        return response.status(404).send({ message: 'Group not found' });
      }

      return response.status(200).send(group);
    } catch (error) {
      console.log(error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async getMyGroups(request, response) {
    try {
      const { offset, limit } = request.query;
      const { userId } = request;

      const query = Group.query()
        .withGraphFetched('[user.[city, state], users.[city, state]]')
        .where(function () {
          this.where('user_id', userId).orWhereExists(
            Group.relatedQuery('users').where('user_id', userId)
          );
        });

      if (offset && limit) {
        const myGroups = await query.page(
          parseInt(offset, 10),
          parseInt(limit, 10)
        );

        return response.status(200).send(myGroups);
      }

      const myGroups = await query;

      return response.status(200).send(myGroups);
    } catch (error) {
      console.log(error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async findAll(request, response) {
    try {
      const { offset, limit, showMyGroups = '0' } = request.query;
      const { userId } = request;

      const query = Group.query().withGraphFetched(
        '[user.[city, state], users.[city, state]]'
      );

      if (showMyGroups === '0') {
        query.where(function () {
          this.where('user_id', '!=', userId).whereNotExists(
            Group.relatedQuery('users').where('user_id', userId)
          );
        });
      }

      if (offset && limit) {
        const groups = await query.page(
          parseInt(offset, 10),
          parseInt(limit, 10)
        );

        return response.status(200).send(groups);
      }

      const groups = await query;

      return response.status(200).send(groups);
    } catch (error) {
      console.log(error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async create(request, response) {
    try {
      const { name } = request.body;
      const { userId, file } = request;

      const groupImage = file ? file.filename : undefined;

      const groupCreated = await Group.query()
        .insertAndFetch({
          name,
          user_id: userId,
          group_image: groupImage,
        })
        .withGraphFetched('[user]');

      return response.status(201).send(groupCreated);
    } catch (error) {
      console.log(error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async update(request, response) {
    try {
      const { name } = request.body;
      const { userId, file } = request;
      const { id } = request.params;

      const groupImage = file ? file.filename : undefined;

      const group = await Group.query().findById(id);

      if (!group) {
        return response.status(404).send({ message: 'Group not found' });
      }

      if (group.user_id !== userId) {
        return response
          .status(400)
          .send({ message: 'User is not owner of the group' });
      }

      console.log(name);
      await Group.query()
        .update({
          name,
          group_image: groupImage,
        })
        .where('id', id);

      if (file && group.group_image) {
        await fs.unlinkSync(
          path.join(__dirname, `../../uploads/${group.group_image}`)
        );
      }

      return response
        .status(200)
        .send({ message: 'Group updated successfully!' });
    } catch (error) {
      console.log(error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async delete(request, response) {
    try {
      const { id } = request.params;
      const { userId } = request;

      const user = await User.query().findById(userId);

      if (!user) {
        return response.status(404).send({ message: 'User not found' });
      }

      const group = await Group.query().findById(id);

      if (!group) {
        return response.status(404).send({ message: 'Group not found' });
      }

      if (group.user_id !== userId) {
        return response
          .status(400)
          .send({ message: 'User is not owner of the group' });
      }
      await Group.query().deleteById(id);

      return response
        .status(200)
        .send({ message: 'Group deleted successfully!' });
    } catch (error) {
      console.log(error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async removeUser(request, response) {
    try {
      const { group_id, user_id } = request.params;
      const { userId } = request;

      const owner = await User.query().findById(userId);

      if (!owner) {
        return response.status(404).send({ message: 'Owner not found' });
      }

      const userToRemove = await User.query().findById(userId);

      if (!userToRemove) {
        return response.status(404).send({ message: 'User not found' });
      }

      const group = await Group.query().findById(group_id);

      if (!group) {
        return response.status(404).send({ message: 'Group not found' });
      }

      if (group.user_id !== userId) {
        return response
          .status(400)
          .send({ message: 'User is not owner of the group' });
      }

      const existUserInGroup = await Group.query()
        .findById(group_id)
        .whereExists(Group.relatedQuery('users').where('user_id', user_id));

      if (!existUserInGroup) {
        return response.status(400).send({ message: "User isn't  in group" });
      }

      await User.relatedQuery('groups')
        .for(user_id)
        .unrelate()
        .where('group_id', group_id);

      return response
        .status(200)
        .send({ message: 'Group deleted successfully!' });
    } catch (error) {
      console.log(error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async joinUser(request, response) {
    try {
      const { group_id } = request.body;
      const { userId } = request;

      const group = await Group.query()
        .findById(group_id)
        .withGraphFetched('[user]');

      if (!group) {
        return response.status(404).send({ message: 'Group not found' });
      }

      if (group.user.id === userId) {
        return response
          .status(400)
          .send({ message: 'User is owner of the group' });
      }

      const user = await User.query().findById(userId);

      if (!user) {
        return response.status(404).send({ message: 'User not found' });
      }

      const existUserInGroup = await Group.query()
        .findById(group_id)
        .whereExists(Group.relatedQuery('users').where('user_id', userId));

      if (existUserInGroup) {
        return response
          .status(400)
          .send({ message: 'User is already  in group' });
      }

      await Group.relatedQuery('users').for(group_id).relate(userId);

      return response.status(201).send({ message: 'User joined group' });
    } catch (error) {
      console.log(error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async disjoinUser(request, response) {
    try {
      const { group_id } = request.body;
      const { userId } = request;

      const group = await Group.query()
        .findById(group_id)
        .withGraphFetched('[user]');

      if (!group) {
        return response.status(404).send({ message: 'Group not found' });
      }

      if (group.user.id === userId) {
        return response
          .status(400)
          .send({ message: 'User is owner of the group' });
      }

      const user = await User.query().findById(userId);

      if (!user) {
        return response.status(404).send({ message: 'User not found' });
      }

      const existUserInGroup = await Group.query()
        .findById(group_id)
        .whereExists(Group.relatedQuery('users').where('user_id', userId));

      if (!existUserInGroup) {
        return response.status(400).send({ message: "User isn't  in group" });
      }

      await User.relatedQuery('groups')
        .for(userId)
        .unrelate()
        .where('group_id', group_id);

      return response.status(200).send({ message: 'User joined group' });
    } catch (error) {
      console.log(error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }
}

module.exports = new GroupController();
