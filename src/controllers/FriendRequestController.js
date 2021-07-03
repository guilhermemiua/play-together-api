const { Event, User, FriendRequest } = require('../models');

class FriendRequestController {
  async findById(request, response) {
    try {
      const { id } = request.params;

      const event = await Event.query()
        .findById(id)
        .withGraphFetched('[user, city, state, users]');

      if (!event) {
        return response.status(404).send({ message: 'Event not found' });
      }

      return response.status(200).send(event);
    } catch (error) {
      console.log(error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async findAll(request, response) {
    try {
      const { offset, limit } = request.query;

      const query = Event.query().withGraphFetched(
        '[user, city, state, users]'
      );

      if (offset && limit) {
        const events = await query.page(
          parseInt(offset, 10),
          parseInt(limit, 10)
        );

        return response.status(200).send(events);
      }

      const events = await query;

      return response.status(200).send(events);
    } catch (error) {
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async create(request, response) {
    try {
      const {
        sport,
        local,
        state_id,
        city_id,
        date,
        start_time,
        end_time,
        players_quantity,
      } = request.body;
      const { userId } = request;

      const eventCreated = await Event.query()
        .insertAndFetch({
          sport,
          local,
          state_id,
          city_id,
          date,
          start_time,
          end_time,
          players_quantity,
          user_id: userId,
        })
        .withGraphFetched('[user, city, state]');

      return response.status(201).send(eventCreated);
    } catch (error) {
      console.log(error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async update(request, response) {
    try {
      const {
        local,
        state_id,
        city_id,
        date,
        start_time,
        end_time,
        players_quantity,
      } = request.body;
      const { userId } = request;
      const { id } = request.params;

      const event = await Event.query().findById(id);

      if (!event) {
        return response.status(404).send({ message: 'Event not found' });
      }

      if (event.user_id !== userId) {
        return response
          .status(400)
          .send({ message: 'User is not owner of the event' });
      }

      const eventParticipants = await FriendRequest.query().where(
        'event_id',
        id
      );

      if (players_quantity < eventParticipants.length + 1) {
        return response.status(400).send({
          message: `Event has already ${
            eventParticipants.length + 1
          } participants`,
        });
      }

      await Event.query()
        .update({
          local,
          state_id,
          city_id,
          date,
          start_time,
          end_time,
          players_quantity,
        })
        .where('id', id);

      return response
        .status(200)
        .send({ message: 'Event updated successfully!' });
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

      const event = await Event.query().findById(id);

      if (!event) {
        return response.status(404).send({ message: 'Event not found' });
      }

      if (event.user_id !== userId) {
        return response
          .status(400)
          .send({ message: 'User is not owner of the event' });
      }
      await Event.query().deleteById(id);

      return response
        .status(200)
        .send({ message: 'Event deleted successfully!' });
    } catch (error) {
      console.log(error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async removeUser(request, response) {
    try {
      const { event_id, user_id } = request.params;
      const { userId } = request;

      const owner = await User.query().findById(userId);

      if (!owner) {
        return response.status(404).send({ message: 'Owner not found' });
      }

      const userToRemove = await User.query().findById(userId);

      if (!userToRemove) {
        return response.status(404).send({ message: 'User not found' });
      }

      const event = await Event.query().findById(event_id);

      if (!event) {
        return response.status(404).send({ message: 'Event not found' });
      }

      if (event.user_id !== userId) {
        return response
          .status(400)
          .send({ message: 'User is not owner of the event' });
      }

      const existUserInEvent = await Event.query()
        .findById(event_id)
        .whereExists(Event.relatedQuery('users').where('user_id', user_id));

      if (!existUserInEvent) {
        return response.status(400).send({ message: "User isn't  in event" });
      }

      await User.relatedQuery('events')
        .for(user_id)
        .unrelate()
        .where('event_id', event_id);

      return response
        .status(200)
        .send({ message: 'Event deleted successfully!' });
    } catch (error) {
      console.log(error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async joinUser(request, response) {
    try {
      const { event_id } = request.body;
      const { userId } = request;

      const event = await Event.query()
        .findById(event_id)
        .withGraphFetched('[user]');

      if (!event) {
        return response.status(404).send({ message: 'Event not found' });
      }

      if (event.user.id === userId) {
        return response
          .status(400)
          .send({ message: 'User is owner of the event' });
      }

      const eventParticipants = await FriendRequest.query().where(
        'event_id',
        event_id
      );

      // -1 because owner user counts as one participant
      if (eventParticipants.length === event.players_quantity - 1) {
        return response.status(400).send({ message: 'Event is full' });
      }

      const user = await User.query().findById(userId);

      if (!user) {
        return response.status(404).send({ message: 'User not found' });
      }

      const existUserInEvent = await Event.query()
        .findById(event_id)
        .whereExists(Event.relatedQuery('users').where('user_id', userId));

      if (existUserInEvent) {
        return response
          .status(400)
          .send({ message: 'User is already  in event' });
      }

      await Event.relatedQuery('users').for(event_id).relate(userId);

      return response.status(201).send({ message: 'User joined event' });
    } catch (error) {
      console.log(error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async disjoinUser(request, response) {
    try {
      const { event_id } = request.body;
      const { userId } = request;

      const event = await Event.query()
        .findById(event_id)
        .withGraphFetched('[user]');

      if (!event) {
        return response.status(404).send({ message: 'Event not found' });
      }

      if (event.user.id === userId) {
        return response
          .status(400)
          .send({ message: 'User is owner of the event' });
      }

      const user = await User.query().findById(userId);

      if (!user) {
        return response.status(404).send({ message: 'User not found' });
      }

      const existUserInEvent = await Event.query()
        .findById(event_id)
        .whereExists(Event.relatedQuery('users').where('user_id', userId));

      if (!existUserInEvent) {
        return response.status(400).send({ message: "User isn't  in event" });
      }

      await User.relatedQuery('events')
        .for(userId)
        .unrelate()
        .where('event_id', event_id);

      return response.status(200).send({ message: 'User joined event' });
    } catch (error) {
      console.log(error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }
}

module.exports = new FriendRequestController();
