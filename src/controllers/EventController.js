const { Event, User, EventUser } = require('../models');

class EventController {
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
      const { offset, limit } = request.params;

      const query = Event.query().withGraphFetched(
        '[user, city, state, users]'
      );

      if (offset && limit) {
        const events = await query.page(offset, limit);

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

      const eventParticipants = await EventUser.query().where(
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

      await User.relatedQuery('events').for(userId).unrelate();

      return response.status(200).send({ message: 'User joined event' });
    } catch (error) {
      console.log(error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }
}

module.exports = new EventController();
