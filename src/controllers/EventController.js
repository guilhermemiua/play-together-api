const { formatISO, parseISO } = require('date-fns');
const { Event, User, EventUser, ReviewUser } = require('../models');

class EventController {
  async findById(request, response) {
    try {
      const { id } = request.params;

      const event = await Event.query()
        .findById(id)
        .withGraphFetched(
          '[user.[city, state], city, state, users.[city, state]]'
        );

      if (!event) {
        return response.status(404).send({ message: 'Event not found' });
      }

      return response.status(200).send(event);
    } catch (error) {
      console.log(error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async getMyEvents(request, response) {
    try {
      const { offset, limit, type = 'past' } = request.query;
      const { userId } = request;

      const query = Event.query()
        .withGraphFetched(
          '[user.[city, state], city, state, users.[city, state]]'
        )
        .where(function () {
          this.where('user_id', userId).orWhereExists(
            Event.relatedQuery('users').where('user_id', userId)
          );
        });

      if (type === 'upcoming') {
        query
          .where('date', '>=', new Date())
          .andWhere('start_time', '>=', new Date());
      } else if (type === 'past') {
        query
          .where('date', '<=', new Date())
          .andWhere('end_time', '<=', new Date());
      }

      if (offset && limit) {
        const myEvents = await query.page(
          parseInt(offset, 10),
          parseInt(limit, 10)
        );

        return response.status(200).send(myEvents);
      }

      const myEvents = await query;

      return response.status(200).send(myEvents);
    } catch (error) {
      console.log(error);
      return response.status(500).send({ message: 'Internal server error' });
    }
  }

  async findAll(request, response) {
    try {
      const {
        offset,
        limit,
        showFull = '0',
        showMyEvents = '0',
        type,
        cityId,
      } = request.query;
      const { userId } = request;

      const query = Event.query().withGraphFetched(
        '[user.[city, state], city, state, users.[city, state]]'
      );

      if (showMyEvents === '0') {
        query.where(function () {
          this.where('user_id', '!=', userId).whereNotExists(
            Event.relatedQuery('users').where('user_id', userId)
          );
        });
      }

      // IF SHOW FULL, SHOW ALL THE EVENTS INDEPENDENT OF PLAYERS QUANTITY
      if (showFull === '0') {
        query.where(
          'players_quantity',
          '>',
          Event.relatedQuery('users').count()
        );
      }

      if (type === 'upcoming') {
        query
          .where('date', '>=', new Date())
          .andWhere('start_time', '>=', new Date());
      } else if (type === 'past') {
        query
          .where('date', '<=', new Date())
          .andWhere('end_time', '<=', new Date());
      }

      if (cityId) {
        query.where('city_id', parseInt(cityId, 10));
      }

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
      console.log(error);
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
          start_time: this.joinDateAndTime(date, start_time),
          end_time: this.joinDateAndTime(date, end_time),
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

      const eventParticipants = await EventUser.query().where('event_id', id);

      if (players_quantity < eventParticipants.length) {
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
          start_time: this.joinDateAndTime(date, start_time),
          end_time: this.joinDateAndTime(date, end_time),
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

  joinDateAndTime(date, time) {
    const newDate = formatISO(parseISO(date), { representation: 'date' });
    const newTime = formatISO(parseISO(time), {
      representation: 'time',
    });

    return `${newDate}T${newTime}`;
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

  async reviewUsers(request, response) {
    try {
      const { event_id, review_users } = request.body;
      const { userId } = request;

      const event = await Event.query()
        .findById(event_id)
        .withGraphFetched('[user]');

      if (!event) {
        return response.status(404).send({ message: 'Event not found' });
      }

      const reviews = await ReviewUser.query()
        .where('event_id', event_id)
        .andWhere('user_id', userId);

      if (reviews.length) {
        return response
          .status(400)
          .send({ message: 'User already reviewed users' });
      }

      await Promise.all(
        review_users.map(async (userReview) => {
          await ReviewUser.query().insert({
            user_id: userId,
            user_reviewed_id: userReview.user_id,
            event_id,
            rating: userReview.rating,
          });
        })
      );

      return response.status(201).send({ message: 'Users reviewed' });
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
      if (eventParticipants.length === event.players_quantity) {
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

module.exports = new EventController();
